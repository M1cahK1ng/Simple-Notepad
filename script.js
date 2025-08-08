// script.js

// --- DOM Elements ---
const noteListSection = document.getElementById('noteListSection');
const addEditNoteSection = document.getElementById('addEditNoteSection');
const viewNoteSection = document.getElementById('viewNoteSection');

const addNoteBtn = document.getElementById('addNoteBtn');
const noteForm = document.getElementById('noteForm');
const noteIdInput = document.getElementById('noteIdInput');
const noteContentInput = document.getElementById('noteContent');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const noteFormTitle = document.getElementById('noteFormTitle');
const notesContainer = document.getElementById('notesContainer');
const noNotesMessage = document.getElementById('noNotesMessage');

const viewNoteTitle = document.getElementById('viewNoteTitle');
const viewNoteContent = document.getElementById('viewNoteContent');
const viewNoteCreated = document.getElementById('viewNoteCreated');
const viewNoteUpdated = document.getElementById('viewNoteUpdated');
const editViewNoteBtn = document.getElementById('editViewNoteBtn');
const deleteViewNoteBtn = document.getElementById('deleteViewNoteBtn');
const backToListBtn = document.getElementById('backToListBtn');

// --- Global Variables ---
let notes = []; // Array to hold our notes

// --- Utility Functions ---

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString(undefined, options);
}

function showSection(sectionToShow) {
    noteListSection.classList.add('hidden');
    addEditNoteSection.classList.add('hidden');
    viewNoteSection.classList.add('hidden');
    sectionToShow.classList.remove('hidden');
}

// --- Data Management (localStorage) ---

function loadNotes() {
    const storedNotes = localStorage.getItem('mySimpleLogNotes');
    if (storedNotes) {
        notes = JSON.parse(storedNotes);
    }
    renderNotes();
}

function saveNotes() {
    localStorage.setItem('mySimpleLogNotes', JSON.stringify(notes));
    renderNotes();
}

// --- Render Functions ---

function renderNotes() {
    notesContainer.innerHTML = ''; // Clear existing notes
    if (notes.length === 0) {
        noNotesMessage.classList.remove('hidden');
        return;
    }
    noNotesMessage.classList.add('hidden');

    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.classList.add('note-card');
        noteCard.setAttribute('data-id', note.id); // Store ID for easy lookup

        const title = document.createElement('h3');
        // Use first line or first 50 chars as title preview
        title.textContent = note.content.split('\n')[0].substring(0, 50) + (note.content.split('\n')[0].length > 50 ? '...' : '');
        noteCard.appendChild(title);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('note-card-actions');

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            editNote(note.id);
        });
        actionsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            deleteNote(note.id);
        });
        actionsDiv.appendChild(deleteBtn);

        noteCard.appendChild(actionsDiv);

        noteCard.addEventListener('click', () => viewNote(note.id)); // Click card to view details
        notesContainer.appendChild(noteCard);
    });
}

// --- Event Handlers (CRUD Operations) ---

// Add/Edit Form Submission
noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = noteIdInput.value;
    const content = noteContentInput.value.trim();

    if (!content) {
        alert('Note content cannot be empty.');
        return;
    }

    if (id) {
        // Editing existing note
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex > -1) {
            notes[noteIndex].content = content;
            notes[noteIndex].updatedAt = new Date().toISOString();
        }
    } else {
        // Adding new note
        const newNote = {
            id: generateUniqueId(),
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.unshift(newNote); // Add to the beginning
    }
    saveNotes();
    noteForm.reset();
    showSection(noteListSection); // Go back to list view
});

// Show Add Note Form
addNoteBtn.addEventListener('click', () => {
    noteForm.reset();
    noteIdInput.value = ''; // Clear ID for new note
    noteFormTitle.textContent = 'Add New Note';
    saveNoteBtn.textContent = 'Save Note';
    showSection(addEditNoteSection);
});

// Cancel Add/Edit Form
cancelNoteBtn.addEventListener('click', () => {
    noteForm.reset();
    showSection(noteListSection);
});

// Edit Note (from list or view)
function editNote(id) {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
        noteIdInput.value = noteToEdit.id;
        noteContentInput.value = noteToEdit.content;
        noteFormTitle.textContent = 'Edit Note';
        saveNoteBtn.textContent = 'Update Note';
        showSection(addEditNoteSection);
    }
}

// Delete Note
function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        showSection(noteListSection); // Always go back to list after delete
    }
}

// View Note Details
function viewNote(id) {
    const noteToView = notes.find(note => note.id === id);
    if (noteToView) {
        viewNoteTitle.textContent = noteToView.content.split('\n')[0].substring(0, 50) + (noteToView.content.split('\n')[0].length > 50 ? '...' : '');
        viewNoteContent.textContent = noteToView.content;
        viewNoteCreated.textContent = formatDate(noteToView.createdAt);
        viewNoteUpdated.textContent = formatDate(noteToView.updatedAt);

        // Set up edit/delete buttons for the view screen
        editViewNoteBtn.onclick = () => editNote(id);
        deleteViewNoteBtn.onclick = () => deleteNote(id);

        showSection(viewNoteSection);
    }
}

// Back to list from view screen
backToListBtn.addEventListener('click', () => {
    showSection(noteListSection);
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', loadNotes);

// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
