'use strict';
// Таймер в секундах на один ответ
const answerTimer = 10;
// Массив с номерами вопросов и ответов для одного раунда
let roundNumbers = [],
// Массив вопросов и ответов для одного раунда
		roundQuestionsAndAnswers = [],
// Массив для хранения уже заданных вопросов
		usedNumbers = [];
// Кнопка "Новая игра"
let newGameBtn = document.getElementsByClassName( 'quiz__game-btn' )[0],
// Кнопка "Новый раунд"
	newRoundBtn = document.getElementsByClassName( 'quiz__game-btn' )[1],
// Кнопка "Начать заново"
	clearGameBtn = document.getElementsByClassName( 'quiz__game-btn' )[2],
// Поле для отображения вопроса
	questionPlace = document.querySelector( '.quiz__question-txt' ),
// Поле для отображения таймера обратного отсчета
	timerPlace = document.querySelector( '.quiz__countdown' );

//подключаем файл с вопросами
	var xhr = new XMLHttpRequest();
//создаем асинхронный запрос
	xhr.open('GET', 'quiz.json', true);
//вызываем асинхронный запрос
	xhr.send();
//событие "по готовности" - обрабатывает полученный файл
	xhr.onreadystatechange = function() { 
		if (xhr.readyState != 4) return;
		if (xhr.status != 200) {
				console.log('Ошибка!');
				};
// если файл получен без проблем, обрабатываем его 
// это массив всех вопросов и ответов
		var allQuestions = JSON.parse( xhr.responseText ); 

// Функция дает случайное число, не входящее в массив уже использованых номеров
function getRandomNumber(min = 0, max = 49) {
	do {
		var rand = parseInt(Math.random() * (max - min) + min);
	}
	while (usedNumbers.indexOf(rand) !== -1);
	return rand
};

// Функция дает три случайных индекса массива вопросов и ответов
function getRoundNumbers() {
	for (var i = 0; i < 3; i++) {
// получаем уникальное число
		var number = getRandomNumber();
// записываем это число в массив использованных чисел
			roundNumbers.push(number);
// записываем это число в массив чисел раунда
			usedNumbers.push(number);
		}
	};

//создаем класс для всей игры
function Quiz(rightAnswersCount, wrongAnswersCount, roundsCount, escapeChance) {
	this.rightAnswersCount = rightAnswersCount;
	this.wrongAnswersCount = wrongAnswersCount;
	this.roundsCount = roundsCount;
	this.escapeChance = escapeChance;
};

//новая версия алгоритма 

// Счётчик заданных вопросов = 0
// Очистим массивы номеров для раунда и вопросов и ответов раунда
// Получим новый массив вопросов и ответов (из выборки исключаем уже заданные вопросы)
// Цикл while счётчик заданых вопросов < 3
//  Выводим вопрос
//  Включаем таймер 10 секунд
//   Если ввели ответ - 
//     - сбросить таймер
//     - увеличить счётчик заданных вопросов на 1
//     - включить функцию проверки ответа
//     - следующая итерация 
//   Если не ввели ответ и прошло 10 секунд
//     - включить функцию проверки ответа (считаем за неправильный ответ)
//     - увеличить счётчик заданных вопросов на 1
//     - следующая итерация
// Если счётчик заданных вопросов = 2 (окончание раунда)
//   Скрыть поле ввода ответа 
//   Показать правильные ответы
//   Визуализировать банку
//   Разблокировать кнопку "Новый раунд"

Quiz.prototype.makeRound = function() {
// Создан новый раунд - устанавливаем счетчик заданных вопросов на 0 
	var questionsCouner = 0;
// Функция для показа обратного отсчета на странице
	function countDown() {
		let m = answerTimer;
		(function answerCountdown() {
			if (m <= 10 && m >= 0) {
// Отображаем начальное значение таймера - 10
				timerPlace.innerHTML = m;
				m--;
// не 1 секунда, а 0,909 потому, что на экран надо вывести 11 цифр за 10 секунд, так для каждой цифры времени должно быть меньше
				setTimeout( answerCountdown, 909 );
			};
		})();
	};	
// Проверяем, остались ли незаданными еще хотя бы 3 вопроса
		if ( allQuestions.question.length - usedNumbers.length >= 3 ) {
// Если это не первый раунд в игре, то очищаем массив номеров вопросов
			if ( roundNumbers != [] ) {
				roundNumbers = [];
			};
// Если это не первый раунд в игре, то очищаем массив объектов "вопрос-ответ"
			if (roundQuestionsAndAnswers != []) {
				roundQuestionsAndAnswers = [];
			};
// Отключаем кнопку "новый раунд"
			newRoundBtn.setAttribute( 'disabled', '' );
// Добавляем модификатор --disabled кнопке "новый раунд"
			newRoundBtn.classList.add( 'quiz__game-btn--pushed' );
// Получаем массив номеров вопросов для раунда (с учетом вопросов, заданных в предыдущих раундах)
			getRoundNumbers();
// Запускаем цикл для каждого номера из массива вопросов для данного раунда (всего три вопроса), начинаем с 0
			for ( var i = 0; i < roundNumbers.length; i++ ) {
// Создаем массив объектов вопрос-ответ
				roundQuestionsAndAnswers.push(allQuestions.question[roundNumbers[i]]);
			};
// Создаем и сразу запускаем функцию 
			(function tenSeconds(l = 0) {
// Выводим на экран i-й вопрос
				questionPlace.innerHTML = roundQuestionsAndAnswers[l].question;
// Выводим на экран и запускаем 10-секундный таймер с обратным отсчетом
				countDown();
// Увеличиваем счетчик заданных вопросов
				questionsCouner ++;
// Увеличиваем счетчик итераций
				l++;
				console.log( questionsCouner );
// Если еще не задано три вопроса в этом раунде, запускаем заново
				if ( l < 3 ) {
					setTimeout(function() {
						tenSeconds(l);
// Если задано уже три вопроса:
						if( questionsCouner == 3 ) {
// Отсчитываем еще 10 секунд
							setTimeout( function() {
								console.log( 'ура' );
// Убираем блокировку с кнопки "новый раунд"
								newRoundBtn.removeAttribute( 'disabled', '' );
// Убираем модификатор с кнопки "новый раунд"
								newRoundBtn.classList.remove( 'quiz__game-btn--pushed' );
							}, 10000);
						}
					}, 10000);
				};
			})();
		}
// Если вопросы кончились, а пользователь пытается сыграть еще раунд - не создаем раунд, выводим ошибку
		else {
			console.log( 'Все вопросы кончились' );
		};
	};

// конец новой версии алгоритма

// создание новой игры
function makeQuiz() {
// Создаем экземпляр типа Quiz
	var game = new Quiz(0, 0, 0, 0);
// Блокируем возможность повторно нажать кнопку Новая игра
	newGameBtn.setAttribute( 'disabled', '' );
// Добавляем класс --pushed
	newGameBtn.classList.add( 'quiz__game-btn--pushed' );
// Создаем первый раунд
	game.makeRound();
// Обработчик события на кнопке "Еще раунд"
	newRoundBtn.addEventListener( 'click', game.makeRound );
	};

// Обработчик события нажатия на кнопку "Новая игра"
newGameBtn.addEventListener( 'click', makeQuiz );
};

// Алгоритм раунда: https://github.com/2gnc/jslearn/blob/master/homework/src/quiz/quiz-algorythm.jpg 