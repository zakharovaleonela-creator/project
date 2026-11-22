import readLineSync from "readline-sync";

// Власний тип помилки для некоректного введення
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

// Масив усіх витрат. Кожен запис: { title, amount, category }
const expenses = [];

// Форматує суму для виводу: 55 -> "55.00 грн"
const formatMoney = (value) => value.toFixed(2) + " грн";

// Читає непорожній рядок (назва, категорія)
function readNonEmpty(question) {
    const text = readLineSync.question(question).trim();
    if (text === "") {
        throw new ValidationError("Поле не може бути порожнім");
    }
    return text;
}


// Читає суму: повертає число більше нуля (кома або крапка)
function readAmount(question) {
    const raw = readLineSync.question(question).trim();
    if (raw === "") {
        throw new ValidationError("Сума не може бути порожньою");
    }
    const value = Number(raw.replace(",", "."));
    if (Number.isNaN(value)) {
        throw new ValidationError("Сума повинна бути числом");
    }
    if (value <= 0) {
        throw new ValidationError("Сума повинна бути більшою за нуль");
    }
    return value;
}

// Додає нову витрату до масиву
function addExpense() {
    const title = readNonEmpty("Введіть назву: ");
    const amount = readAmount("Введіть суму: ");
    const category = readNonEmpty("Введіть категорію: ").toLowerCase();

    const expense = { title, amount, category };
    expenses.push(expense);

    console.log("Витрату додано");
}

// Показує список витрат (за замовчуванням усі)
function showAll(list = expenses) {
    if (list.length === 0) {
        console.log("Список порожній");
        return;
    }

    list.forEach((e, i) => {
        console.log(`${i + 1}. ${e.title} - ${formatMoney(e.amount)} (${e.category})`);
    });
}

// Пошук витрат за назвою (без урахування регістру)
function searchByTitle() {
    const query = readNonEmpty("Введіть назву для пошуку: ").toLowerCase();
    const found = expenses.filter((e) => e.title.toLowerCase().includes(query));

    if (found.length === 0) {
        console.log("Нічого не знайдено");
        return;
    }
    showAll(found);
}

// Показує 3 найбільші витрати (оригінальний масив не змінюється)
function showTop3() {
    const sorted = expenses.slice();
    sorted.sort((a, b) => b.amount - a.amount);
    showAll(sorted.slice(0, 3));
}

// Звіт: сума витрат за кожною категорією та загальна сума
function categoryReport() {
    if (expenses.length === 0) {
        console.log("Список порожній");
        return;
    }

    // Об'єкт виду { категорія: сума }
    const totals = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});

    Object.keys(totals).forEach((category) => {
        console.log(`${category}: ${formatMoney(totals[category])}`);
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    console.log(`Разом: ${formatMoney(total)}`);
}

// Видаляє витрату за номером зі списку
function deleteExpense() {
    if (expenses.length === 0) {
        console.log("Список порожній");
        return;
    }

    showAll();

    const raw = readLineSync.question("Введіть номер для видалення: ").trim();
    const number = Number(raw);

    if (raw === "" || Number.isNaN(number) || !Number.isInteger(number)) {
        throw new ValidationError("Номер повинен бути цілим числом");
    }
    if (number < 1 || number > expenses.length) {
        throw new ValidationError("Немає запису з таким номером");
    }

    expenses.splice(number - 1, 1);
    console.log("Витрату видалено");
}

// Головне меню: повторюється, доки користувач не вибере "Вийти"
while (true) {
    console.log("");
    console.log("=== Облік витрат ===");
    console.log("1 - Додати витрату");
    console.log("2 - Показати всі");
    console.log("3 - Пошук за назвою");
    console.log("4 - Топ-3 найбільші");
    console.log("5 - Звіт за категоріями");
    console.log("6 - Видалити");
    console.log("0 - Вийти");

    const choice = readLineSync.question("Ваш вибір: ").trim();

    try {
        if (choice === "1") {
            addExpense();
        } else if (choice === "2") {
            showAll();
        } else if (choice === "3") {
            searchByTitle();
        } else if (choice === "4") {
            showTop3();
        } else if (choice === "5") {
            categoryReport();
        } else if (choice === "6") {
            deleteExpense();
        } else if (choice === "0") {
            console.log("До побачення");
            break;
        } else {
            console.log("Невідомий пункт меню");
        }
    } catch (error) {
        if (error instanceof ValidationError) {
            console.log("Помилка: " + error.message);
        } else {
            console.log("Неочікувана помилка: " + error.message);
        }
    }
}