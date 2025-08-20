from functools import wraps

import requests
from clerk_backend_api import Clerk
from django.http import JsonResponse
from jose import jwk, jwt
from jwt import PyJWTError

from flashquiz_proj.settings import CLERK_ISSUER, CLERK_JWKS_URL, CLERK_SECRET_KEY


# NOTE: JWKS stand for JSON Web Key Sets.  We need to use the JWKS to get the public keys from the Clerk API.
def get_jwks():
    response = requests.get(CLERK_JWKS_URL)
    response.raise_for_status()
    return response.json()


# NOTE: Our get_public_keys function will get the public keys from the JWKS
def get_public_keys(kid):
    jwks = get_jwks()
    for key in jwks["keys"]:
        if key["kid"] == kid:
            return jwk.construct(key)

    raise ValueError("Invalid Token")


# NOTE: What happens here is we get unverified headers from the token and then we get the kid from the headers
# what this does is we look through the JWKS for the kid (key id) and then we use that key to decode the token
# after which we get the payload which is sent to Clerk
def decode_token(token):
    try:
        headers = jwt.get_unverified_headers(token)
        kid = headers["kid"]
        public_key = get_public_keys(kid)
        payload = jwt.decode(
            token,
            public_key.to_pem().decode("utf-8"),
            algorithms=["RS256"],
            audience="clerk",
            issuer=CLERK_ISSUER,
        )
        return payload
    except PyJWTError as e:
        raise ValueError(f"Token verification failed: {str(e)}")


# NOTE: Here we're using our own custom decorator.  Clerk authenticated will take a view function and return another view function
# inside of the wrapper, we're going to check to see if the token is valid, if it is, we're going to get the user details from Clerk
def clerk_authenticated(view_func):
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        # Extract  the bearer token from the authorizion header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Authentication Required"}, status=401)

        # the token comes in as Bearer [token], so we split it and take the second element
        token = auth_header.split(" ")[1]

        try:
            # Decode and verify token
            payload = decode_token(token)
            user_id = payload.get("sub")
            if not user_id:
                return JsonResponse({"error": "User ID not found in token"}, status=404)

            # Retrieve user detials from Clerk since it holds all of our users
            clerk_sdk = Clerk(bearer_auth=CLERK_SECRET_KEY)
            user_details = clerk_sdk.users.get(user_id=user_id)

            # Attach user details to the request for further use
            request.user_details = user_details

        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=401)

        # Finally, if the token is valid, we call the original view function(POST, GET, etc.) letting it know the user details from Clerk
        # is valid and attached to the request
        return view_func(self, request, *args, **kwargs)

    return wrapper
