import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

const DeckDetailPage = () => {
  const {
    selectedDeck,
    selectDeck,
    flashcards,
    setFlashcards,
    deleteFlashcard,
  } = useOutletContext();
  const naivigate = useNavigate();
  const { deckId } = useParams();
  useEffect(() => {
    if (!selectedDeck || selectedDeck.id !== Number(deckId)) {
      selectDeck({ id: Number(deckId) });
    }
  }, [deckId, selectedDeck, selectDeck]);
  if (!selectedDeck) return <p>Loading...</p>;

  const handleDelete = async (cardId) => {
    await deleteFlashcard(cardId);
  };

  const handleEdit = (card) => {
    naivigate(`/decks/${selectedDeck.id}/flashcards/${card.id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{selectedDeck.title}</h1>

      <h2 className="text-xl font-semibold mb-2">Flashcards</h2>
      {flashcards.length === 0 ? (
        <p className="text-gray-500">No flashcards yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {flashcards.map((card) => (
            <div
              key={card.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col justify-between"
            >
              <div className="mb-4">
                <p>
                  <span className="font-semibold">Q:</span> {card.question}
                </p>
                <p>
                  <span className="font-semibold">A:</span> {card.answer}
                </p>
                <p>
                  <span className="font-semibold">Hint:</span>{" "}
                  {card.hint || "None"}
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => handleEdit(card)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckDetailPage;
