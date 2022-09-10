const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
const USER_KEY = 'BOOKSHELF_USER';

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage!');
    return false;
  }
  return true;
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function generateId() {
  return +new Date();
}

function addBook() {
  const titleBook = document.getElementById('inputTitle').value;
  const authorBook = document.getElementById('inputAuthor').value;
  const yearBook = document.getElementById('inputBookYear').value;
  const isCompleted = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, titleBook, authorBook, yearBook, isCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function makeBookList(bookObject) {
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = 'Penulis: ' + bookObject.author;

  const bookYear = document.createElement('p');
  bookYear.innerText = 'Tahun: ' + bookObject.year;

  const bookContainer = document.createElement('div');
  bookContainer.classList.add('inner');
  bookContainer.append(bookTitle, bookAuthor, bookYear);

  const container = document.createElement('div');
  container.classList.add('book_item', 'shadow');
  container.append(bookContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.innerText = 'Belum selesai dibaca';
    undoButton.classList.add('green');

    const trashButton = document.createElement('button');
    trashButton.innerText = 'Hapus buku';
    trashButton.classList.add('red');

    const buttonAction = document.createElement('div');
    buttonAction.classList.add('action');
    buttonAction.append(undoButton, trashButton);

    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(bookObject.id);
    });
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(bookObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.innerText = 'Selesai dibaca';
    checkButton.classList.add('green');

    const trashButton = document.createElement('button');
    trashButton.innerText = 'Hapus buku';
    trashButton.classList.add('red');

    const buttonAction = document.createElement('div');
    buttonAction.classList.add('action');
    buttonAction.append(checkButton, trashButton);

    checkButton.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    });
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(bookObject.id);
    });

    container.append(checkButton, trashButton);
  }
  return container;
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const i in books) {
    if (books[i].id === bookId) {
      return i;
    }
  }
  return -1;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
  alert('Buku berhasil dihapus!');
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('incompleteBookshelfList');
  uncompletedBookList.innerHTML = '';

  const completedBookList = document.getElementById('completeBookshelfList');
  completedBookList.innerHTML = '';

  for (const book of books) {
    const bookElemen = makeBookList(book);
    if (!book.isCompleted) {
      uncompletedBookList.append(bookElemen);
    } else {
      completedBookList.append(bookElemen);
    }
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
    welcomeUser();
  }

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  const inputUser = document.getElementById('user');
  inputUser.addEventListener('submit', function (event) {
    saveUser();
  });
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function saveUser() {
  if (isStorageExist()) {
    const nama = document.getElementById('inputNama').value;
    localStorage.setItem(USER_KEY, nama);
  }
}

function welcomeUser() {
  const namaUser = localStorage.getItem(USER_KEY);
  const inputUser = document.getElementById('inputUser');
  const welcome = document.getElementById('jumbotron');
  if (namaUser !== null) {
    inputUser.setAttribute('hidden', true);
    welcome.innerText = `Halo ${namaUser}, Have a nice day! :D`;
    welcome.removeAttribute('hidden');
  } else {
    return;
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let bookData = JSON.parse(serializedData);

  if (bookData !== null) {
    for (const book of bookData) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook() {
  const bookInput = document.getElementById('searchBookTitle').value;
  const filter = bookInput.toUpperCase();
  const foundBookList = document.getElementById('foundBookList');
  for (const book of books) {
    const title = book.title.toUpperCase();
    if (title.indexOf(filter) > -1) {
      console.log('found');
      foundBookList.innerHTML = '<b>Buku ditemukan!</b> <br><br> <b>Judul</b>: ' + book.title + '<br><b>Penulis</b>: ' + book.author + '<br><b>Tahun</b>: ' + book.year;
    } else {
      console.log('not found');
      foundBookList.innerText = 'Buku tidak ditemukan.';
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
