import { useNavigate } from "react-router-dom";

const Decks = ({ decks, deleteDeck, selectDeck }) => {
  const navigate = useNavigate();
  const handleEdit = async (deck) => {
    await selectDeck(deck);
    navigate(`/decks/${deck.id}`);
  };
  return (
    <div className="space-y-4">
      {decks.length === 0 ? (
        <p className="text-gray-500">No decks available. Create one above!</p>
      ) : (
        decks.map((deck) => (
          <div
            key={deck.id}
            className="flex items-center justify-between bg-white shadow rounded-lg p-4 hover:shadow-md transition"
          >
            <div>
              <h2 className="text-lg font-semibold">{deck.title}</h2>
              <p className="text-gray-600 text-sm">{deck.description}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/decks/${deck.id}/study`)}
                className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition"
              >
                Study
              </button>
              <button
                onClick={() => handleEdit(deck)}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
              >
                Edit
              </button>
              <button
                onClick={() => deleteDeck(deck.id)}
                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Decks;
