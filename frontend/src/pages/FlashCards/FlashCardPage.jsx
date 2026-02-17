import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft as ArrowLeftIcon,
  Plus as PlusIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Trash2 as TrashIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashCards/FlashCard";

const FlashCardPage = () => {
  const { id: documentId } = useParams();

  console.log("Document ID from URL:", documentId); // Debugging log

  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const response =
        await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      toast.error("Failed to fetch flashcards");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashCards(documentId);
      toast.success("Flashcards generated successfully");
      fetchFlashcards();
    } catch (error) {
      toast.error("Failed to generate flashcards");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length,
    );
  };

  const handleReview = async (index) => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;
    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      toast.success("FlashCard Reviewed!");
    } catch (error) {
      toast.error("failed to review flashcards.");
      console.error(error);
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);

      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card,
        ),
      );

      toast.success("Flashcard starred status updated");
    } catch (error) {
      toast.error("Failed to update star status");
    }
  };

  const handleConfirmDelteFlashcard = async () => {
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcardSets._id);
      toast.success("Flashcard Set Deleted Successfully!");
      setIsDeleteModalOpen(false);
      fetchFlashcards();
    } catch (error) {
      toast.error("Failed to delete flashcard Sets");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashCardContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (flashcards.length === 0) {
      return (
        <EmptyState
          title="No Flashcards Found"
          description="Generate flashcards for this document to review key concepts and information."
        />
      );
    }

    const currentCard = flashcards[currentCardIndex];
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>

        <div className=" flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={handlePrevCard}
            disabled={flashcards.length <= 1}
          >
            <ChevronLeftIcon size={16} />
            Previous
          </Button>
          <span className=" text-sm text-neutral-600">
            {currentCardIndex + 1} / {flashcards.length}
          </span>
          <Button
            variant="secondary"
            onClick={handleNextCard}
            disabled={flashcards.length <= 1}
          >
            Next
            <ChevronRightIcon size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mb-4">
        <Link
          to={`/documents/${documentId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
        >
          <ArrowLeftIcon size={16} />
          Back to Document
        </Link>
      </div>
      <PageHeader title="flashcards">
        <div className="flex gap-2">
          {!loading &&
            (flashcards.length > 0 ? (
              <>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={deleting}
                >
                  <TrashIcon size={16} />
                  Delete Set
                </Button>
              </>
            ) : (
              <Button onClick={handleGenerateFlashcards} disabled={generating}>
                {generating ? (
                  <Spinner />
                ) : (
                  <>
                    <PlusIcon size={16} />
                    Generate Flashcards
                  </>
                )}
              </Button>
            ))}
        </div>
      </PageHeader>

      {renderFlashCardContent()}

      {/* Delete Confirmation Model */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Flashcard Set"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete all flashcard for this document?
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelteFlashcard}
              disabled={deleting}
              className="px-5 h-11 bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FlashCardPage;
