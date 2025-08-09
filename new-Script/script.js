document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const homeSection = document.getElementById('homeSection');
    const viewNotesBtn = document.getElementById('viewNotesBtn');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteListSection = document.getElementById('noteListSection');
    const addEditNoteSection = document.getElementById('addEditNoteSection');
    const viewNoteSection = document.getElementById('viewNoteSection');
    const notesContainer = document.getElementById('notesContainer');
    const noNotesMessage = document.getElementById('noNotesMessage');

    // Form elements
    const noteForm = document.getElementById('noteForm');
    const noteFormTitle = document.getElementById('noteFormTitle');
    const noteIdInput = document.getElementById('noteIdInput');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const cancelNoteBtn = document.getElementById('cancelNoteBtn');

    // View note elements
    const viewNoteTitle = document.getElementById('viewNoteTitle');
    const viewNoteContent = document.getElementById('viewNoteContent');
    const viewNoteCreated = document.getElementById('viewNoteCreated');
    const viewNoteUpdated = document.getElementById('viewNoteUpdated');
    const editViewNoteBtn = document.getElementById('editViewNoteBtn');
    const deleteViewNoteBtn = document.getElementById('deleteViewNoteBtn');
    const backToListBtn = document.getElementById('backToListBtn');

    let notes = [];
    let currentViewedNoteId = null;

    // --- Functions ---

    /**
     * Gets notes from localStorage.
     * @returns {Array} An array of note objects.
     */
    const getNotes = () => {
        const notesString = localStorage.getItem('my-simple-log-notes');
        return notesString ? JSON.parse(notesString) : [];
    };

    /**
     * Saves notes to localStorage.
     * @param {Array} notesArray - The array of notes to save.
     */
    const saveNotes = (notesArray) => {
        localStorage.setItem('my-simple-log-notes', JSON.stringify(notesArray));
    };

    /**
     * Renders the list of notes to the DOM.
     */
    const renderNotes = () => {
        notesContainer.innerHTML = '';
        if (notes.length === 0) {
            noNotesMessage.classList.remove('hidden');
        } else {
            noNotesMessage.classList.add('hidden');
            // Sort notes by last updated date, newest first
            const sortedNotes = [...notes].sort((a, b) => new Date(b.updated) - new Date(a.updated));
            sortedNotes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.classList.add('note-item');
                noteElement.dataset.id = note.id;
                
                const noteTitle = document.createElement('h3');
                noteTitle.textContent = note.title;

                const noteContentSnippet = document.createElement('p');
                noteContentSnippet.textContent = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');

                noteElement.appendChild(noteTitle);
                noteElement.appendChild(noteContentSnippet);
                notesContainer.appendChild(noteElement);
            });
        }
    };

    /**
     * Hides all main sections and shows the one with the given ID.
     * @param {string} sectionId - The ID of the section to show.
     */
    const showSection = (sectionId) => {
        [homeSection, noteListSection, addEditNoteSection, viewNoteSection].forEach(section => {
            if (section.id === sectionId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    };

    /**
     * Shows the add/edit form.
     * @param {object|null} note - The note to edit, or null to add a new note.
     */
    const showAddEditSection = (note = null) => {
        if (note) {
            // Editing existing note
            noteFormTitle.textContent = 'Edit Note';
            noteIdInput.value = note.id;
            noteTitleInput.value = note.title;
            noteContent.value = note.content;
        } else {
            // Adding new note
            noteFormTitle.textContent = 'Add New Note';
            noteForm.reset();
            noteIdInput.value = '';
        }
        showSection('addEditNoteSection');
    };

    /**
     * Shows the view note section with details of the selected note.
     * @param {string} noteId - The ID of the note to view.
     */
    const showViewNoteSection = (noteId) => {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        currentViewedNoteId = note.id;

        viewNoteTitle.textContent = note.title;
        viewNoteContent.textContent = note.content;
        viewNoteCreated.textContent = new Date(note.created).toLocaleString();
        viewNoteUpdated.textContent = new Date(note.updated).toLocaleString();

        showSection('viewNoteSection');
    };

    /**
     * Handles the note form submission for both creating and updating notes.
     * @param {Event} e - The form submit event.
     */
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const id = noteIdInput.value;
        const title = noteTitleInput.value.trim();
        const content = noteContent.value.trim();
        const now = new Date().toISOString();

        if (!title || !content) {
            alert('Please fill in both title and content.');
            return;
        }

        if (id) {
            // Update existing note
            const noteIndex = notes.findIndex(n => n.id === id);
            if (noteIndex > -1) {
                notes[noteIndex].title = title;
                notes[noteIndex].content = content;
                notes[noteIndex].updated = now;
            }
        } else {
            // Add new note
            const newNote = {
                id: `note-${Date.now()}`,
                title,
                content,
                created: now,
                updated: now,
            };
            notes.push(newNote);
        }

        saveNotes(notes);
        renderNotes();
        showSection('noteListSection');
        noteForm.reset();
    };

    /**
     * Deletes a note.
     * @param {string} noteId - The ID of the note to delete.
     */
    const deleteNote = (noteId) => {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(n => n.id !== noteId);
            saveNotes(notes);
            renderNotes();
            showSection('noteListSection');
        }
    };


    // --- Event Listeners ---

    viewNotesBtn.addEventListener('click', () => showSection('noteListSection'));

    addNoteBtn.addEventListener('click', () => showAddEditSection());

    cancelNoteBtn.addEventListener('click', () => {
        noteForm.reset();
        showSection('noteListSection');
    });

    noteForm.addEventListener('submit', handleFormSubmit);

    notesContainer.addEventListener('click', (e) => {
        const noteItem = e.target.closest('.note-item');
        if (noteItem) {
            const noteId = noteItem.dataset.id;
            showViewNoteSection(noteId);
        }
    });

    backToListBtn.addEventListener('click', () => showSection('noteListSection'));

    editViewNoteBtn.addEventListener('click', () => {
        const note = notes.find(n => n.id === currentViewedNoteId);
        if (note) {
            showAddEditSection(note);
        }
    });

    deleteViewNoteBtn.addEventListener('click', () => {
        if (currentViewedNoteId) {
            deleteNote(currentViewedNoteId);
        }
    });


    // --- Initialization ---
    const initializeApp = () => {
        notes = getNotes();
        renderNotes();
        showSection('homeSection');
    };

    initializeApp();
});