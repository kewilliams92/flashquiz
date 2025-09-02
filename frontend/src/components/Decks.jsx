import { useNavigate } from "react-router-dom";

const Decks = ({ decks, deleteDeck, selectDeck }) => {
  const navigate = useNavigate();

  //We select the deck and navigate to the deck detail page
  const handleEdit = async (deck) => {
    await selectDeck(deck);
    navigate(`/decks/${deck.id}`);
  };

  //A simple loading screen
  if (!decks) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {decks.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg">
            No decks available. Create a blank one, or use AI to construct one
            above!
          </p>
        </div>
      ) : (
        decks.map((deck) => (
          <div
            key={deck.id}
            className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 shadow-lg rounded-xl p-6 hover:shadow-xl hover:from-slate-100 hover:to-gray-100 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {deck.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {deck.description}
              </p>
            </div>
            <div className="flex space-x-3 ml-6">
              <button
                onClick={() => navigate(`/decks/${deck.id}/study`)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Study
              </button>
              <button
                onClick={() => handleEdit(deck)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => deleteDeck(deck.id)}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
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
