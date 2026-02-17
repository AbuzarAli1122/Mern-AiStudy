import React, { useState, useEffect } from "react";
import flashCardService from "../../services/flashCardService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import FlashCardSetCard from "../../components/flashCards/FlashCardSetCard";
import toast from "react-hot-toast";

const FlashCardListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashCardService.getAllFlashcardSets();
        setFlashcardSets(response.data);
      } catch (error) {
        toast.error("Failed to Fetch Flashcard sets");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardSets();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcardSets.length === 0) {
      return (
        <EmptyState
          title="No Flashcard Sets Found"
          description="You have not generated any flashcards yet.
        Go to a document to create a set."
        />
      );
    }

    return (
      <div
        className="
      grid 
      [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] 
      gap-4 sm:gap-6"
      >
        {flashcardSets.map((set) => (
          <FlashCardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    );
  };
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 ">
      <PageHeader title="All Flashcard Sets" />
      {renderContent()}
    </div>
  );
};

export default FlashCardListPage;
