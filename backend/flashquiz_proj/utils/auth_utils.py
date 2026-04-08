from functools import wraps

import requests
from clerk_backend_api import Clerk
from django.http import JsonResponse
from flashquiz_proj.settings import CLERK_ISSUER, CLERK_JWKS_URL, CLERK_SECRET_KEY
from jose import jwk, jwt
from jose.exceptions import JWTError  # use jose's error, not PyJWT's


def get_jwks():
    response = requests.get(CLERK_JWKS_URL)
    response.raise_for_status()
    return response.json()


def get_public_keys(kid):
    jwks = get_jwks()
    for key in jwks["keys"]:
        if key["kid"] == kid:
            return jwk.construct(key)
    raise ValueError("Invalid Token")


def decode_token(token):
    try:
        headers = jwt.get_unverified_headers(token)
        kid = headers["kid"]
        public_key = get_public_keys(kid)
        payload = jwt.decode(
            token,
            public_key.to_pem().decode("utf-8"),
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
        )
        return payload
    except JWTError as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"JWTError: {str(e)}")
        logger.error(f"CLERK_ISSUER: {CLERK_ISSUER}")
        raise ValueError(f"Token verification failed: {str(e)}")
    except Exception as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected error in decode_token: {type(e).__name__}: {str(e)}")
        raise ValueError(f"Token verification failed: {str(e)}")


def clerk_authenticated(view_func):
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Authentication Required"}, status=401)

        token = auth_header.split(" ")[1]

        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
            if not user_id:
                return JsonResponse({"error": "User ID not found in token"}, status=404)

            clerk_sdk = Clerk(bearer_auth=CLERK_SECRET_KEY)
            user_details = clerk_sdk.users.get(user_id=user_id)
            request.user_details = user_details

        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=401)

        return view_func(self, request, *args, **kwargs)

    return wrapper
