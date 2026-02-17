import React, { useState, useEffect } from "react";
import {
  Plus as PlusIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Trash2 as Trash2Icon,
  ArrowLeft as ArrowLeftIcon,
  Sparkles as SparklesIcon,
  Brain as BrainIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashCardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import FlashCard from "./FlashCard";

const FlashCardManaager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSets, setSelectedSets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeletedModelOpen, setIsDeletedModelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  const fetchFlashCardsSets = async () => {
    setLoading(true);
    try {
      const response =
        await flashCardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data);
    } catch (error) {
      toast.error("Failed to Fetch FlashCards sets");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchFlashCardsSets();
    }
  }, [documentId]);

  const handleGenerateFlashCards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashCards(documentId);
      toast.success("FlashCard generate successfully!");
      fetchFlashCardsSets();
    } catch (error) {
      toast.error("Faild to generate Flashcards");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    if (selectedSets) {
      handleReview(currentCardIndex);
      setCurrentCardIndex(
        (prevIndex) => (prevIndex + 1) % selectedSets.cards.length,
      );
    }
  };

  const handlePrevCard = () => {
    if (selectedSets) {
      handleReview(currentCardIndex);
      setCurrentCardIndex(
        (prevIndex) =>
          (prevIndex - 1 + selectedSets.cards.length) %
          selectedSets.cards.length,
      );
    }
  };

  const handleReview = async (index) => {
    const currentCard = selectedSets?.cards[currentCardIndex];
    if (!currentCard) return;
    try {
      await flashCardService.reviewFlashcard(currentCard._id, index);
      toast.success("FlashCard Reviewed!");
    } catch (error) {
      toast.error("failed to review flashcards.");
      console.error(error);
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashCardService.toggleStar(cardId);

      const updatedSets = flashcardSets.map((set) => {
        if (set._id !== selectedSets._id) {
          return set;
        }

        return {
          ...set,
          cards: set.cards.map((card) =>
            card._id === cardId
              ? { ...card, isStarred: !card.isStarred }
              : card,
          ),
        };
      });

      setFlashcardSets(updatedSets);
      setSelectedSets(updatedSets.find((set) => set._id === selectedSets._id));

      toast.success("Flashcard starred status updated");
    } catch (error) {
      toast.error("Failed to update star status");
    }
  };

  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeletedModelOpen(true);
  };

  const handleConfirmDelte = async () => {
    if (!setToDelete) return;
    setDeleting(true);
    try {
      await flashCardService.deleteFlashcardSet(setToDelete._id);
      toast.success("Flashcard Set Deleted Successfully!");
      setIsDeletedModelOpen(false);
      setSetToDelete(null);
      fetchFlashCardsSets();
    } catch (error) {
      toast.error("Failed to delete flashcard Sets");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };
  const handleSelectSet = (set) => {
    setSelectedSets(set);
    setCurrentCardIndex(0);
  };

  const renderFlashCardViewer = () => {
    const currentCard = selectedSets.cards[currentCardIndex];
    return (
      <div className="space-y-8">
        {/* back button */}
        <button
          onClick={() => setSelectedSets(null)}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
        >
          <ArrowLeftIcon
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
            strokeWidth={2}
          />
          Back to Sets
        </button>

        {/* FlashCard Display */}
        <div className="flex flex-col items-center space-y-8">
          <div className="w-full max-w-2xl">
            <FlashCard
              flashcard={currentCard}
              onToggleStar={handleToggleStar}
            />
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={handlePrevCard}
              disabled={selectedSets.cards.length <= 1}
              className="group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-100 "
            >
              <ChevronLeftIcon
                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
                strokeWidth={2.5}
              />
              Previous
            </button>

            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 ">
              <span className="text-sm font-semibold text-slate-700 ">
                {currentCardIndex + 1}{" "}
                <span className="text-slate-400 font-normal">/</span>
                {""}
                {selectedSets.cards.length}
              </span>
            </div>

            <button
              onClick={handleNextCard}
              disabled={selectedSets.cards.length <= 1}
              className="group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-100 "
            >
              Next
              <ChevronRightIcon
                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSetList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      );
    }
    if (flashcardSets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 mb-4 ">
            <BrainIcon className="w-8 h-8 text-emerald-600" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Flashcards Yet
          </h3>
          <p className="text-sm  text-slate-500 mb-8 text-center max-w-sm">
            Generate flashcards from your document to start learning and
            reinforce your knowledge.
          </p>
          <button
            onClick={handleGenerateFlashCards}
            disabled={generating}
            className="group inline-flex items-center gap-2 px-6 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 "
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" strokeWidth={2} />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header with Generate Button  */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Your Flashcard Sets
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {flashcardSets.length}{" "}
              {flashcardSets.length === 1 ? "set" : "sets"} available
            </p>
          </div>
          <button
            className="group inline-flex items-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 "
            onClick={handleGenerateFlashCards}
            disabled={generating}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" strokeWidth={2.5} />
                Generate New Set
              </>
            )}
          </button>
        </div>

        {/* Flashcard Set Grid  */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcardSets.map((set) => (
            <div
              key={set._id}
              onClick={() => handleSelectSet(set)}
              className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-50/10"
            >
              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteRequest(e, set)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <Trash2Icon className="w-4 h-4" strokeWidth={2} />
              </button>

              {/* Set Content */}

              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100">
                  <BrainIcon
                    className="w-6 h-6 text-emerald-600"
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-1">
                    Flashcard Set
                  </h4>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Created {moment(set.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-sm font-semibold text-emerald-700">
                      {set.cards.length}
                      {""}
                      {set.cards.length === 1 ? "card" : "cards"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
        {selectedSets ? renderFlashCardViewer() : renderSetList()}
      </div>

      {/* Delete Confirmation Model */}
      <Modal
        isOpen={isDeletedModelOpen}
        onClose={() => setIsDeletedModelOpen(false)}
        title="Delete Flashcard Set?"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this flashcard set? this action
            cannot be undone and card will be permantly removed.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeletedModelOpen(false)}
              disabled={deleting}
              className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed "
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelte}
              disabled={deleting}
              className="px-5 h-11 bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete Set"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FlashCardManaager;
