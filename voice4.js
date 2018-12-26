var windowmain;                                     // указатель на окно с открытым приложением
var modaltitle = "";								                // Заголовок текущего окна
var editjob = "";									                  // изменение, удаление задания
var speech = new SpeechSynthesisUtterance();        // Возвращает новый экземпляр объекта т.е. включает динамики (массив)
    speech.lang = 'ru-Ru';                          // Язык для диктовки текста
var voicestart = false;                             // флаг 1-го включения микрофона
var recognizer = new webkitSpeechRecognition();   	// Создаем распознаватель
var recognizing = false;
recognizer.interimResults = false;                 	// true = распознавание началось ещё до того, как пользователь закончит говорить
recognizer.lang = 'ru-Ru';                        	// Язык для распознования
recognizer.continuous = true;                     	// когда пользователь прекратил говорить, распознование не закончилось

function speechmic () {                             // Включаем микрофон
  recognizer.start();
}
//-----------------------------------------------------------------------------------------------
speech.onstart = function() {                       // когда идет текст, 
  console.log('speech.onstart = voicestart='+recognizing);
  recognizer.stop();                                //                  отключить микрофн
  recognizing = false;
}                                                   //
speech.onend = function() {                         // когда текст закончился, 
  console.log('speech.onend = voicestart='+recognizing);
  if (!recognizing) recognizer.start();             //                        включить микрофон
  recognizing = true;
}
//-----------------------------------------------------------------------------------------------

recognizer.onresult = function (event) {            // Вызывается если результат — слово или фраза были распознаны положительно
  var result = event.results[event.resultIndex];    // содержит все данные, связанные с конечным результатом распознавания речи
  if (result.isFinal) {                             // результат является окончательным
    voicecommand((result[0].transcript).trim().toLowerCase());	// удалиь пробелы слева и справа, все буквы - мленькие
  } 
}

recognizer.onstart = function(){                    // вллючился микрофон
  document.getElementById('micbutton').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
  //if (!voicestart) strvoice("Приветствую вас, " + myname);
  console.log('recognizer.onstart = recognizing='+recognizing);
   if (!voicestart) strvoice("Произнесите команду."); voicestart = true;
}

recognizer.onend = function(){                      // Закончилось время ожидания (примерно 15 сек)
  //document.getElementById('micbutton').classList.remove("miganie");	// убрать МИГАНИЕ МИКРОФОНА
  //strcommand="";
    if (recognizing) { 
      strvoice("Я жду команду");
      recognizer.start();
    }
}
//----------------------------------------------------------------
// ПРОИЗНЕСТИ КОМАНДУ 
//----------------------------------------------------------------}
function strvoice(textvoice){
  speech.text = textvoice;					  		        // текстовая строка 
  speech.volume = 1;                            	// громкость речи
  speech.rate = 1;                              	// темп речи
  speech.pitch = 1;                             	// диапазон речи
  window.speechSynthesis.speak(speech);         	// произнести тестовую строку
}
  
//----------------------------------------------------------------
// АНАЛИЗ ГОЛОСОВОЙ КОМАНДЫ 
//----------------------------------------------------------------
function voicecommand(strcommand) {
  var modal = document.getElementById('myModal'); // указатель на модальное окно с ключевыми фразами
  var today = document.getElementById("today");   // указатель на дату в строке с заданием
  var job = document.getElementById("job");       // указатель на задание
  document.getElementById('voice').innerHTML = strcommand;
  switch (strcommand) { 
    case 'выше':
      window.scrollBy(0,-200);                    // прокрутка окна вниз
    break
    case 'ниже':                                  // прокрутка окна вверх
      window.scrollBy(0,200);
    break
    case 'закрыть программу':
      modaltitle = 'ЗАКРЫТЬ ПРОГРАММУ';
      strvoice("Сохранить данные в таблице?");
    break
    case 'сохранить таблицу':                     // СОХРАНИТЬ ТАБЛИЦУ НА ДИСКЕ
       dbsaveJob();
    break
    case 'добавить':                              // ВВОД НОВОГО ЗАДАНИЯ
    //case 'новое задание':
    console.log('000');
      strvoice("скажите новое задание");
      editjob = 'новое';
      strcommand="";
      voicecommand(strcommand);
    break
    case 'изменить':                              // изменить существующее задание
    case 'изменить задание':
    	strvoice("какое задание изменить?");
    	editjob = 'изменить';
    	modaltitle = 'ИЗМЕНИТЬ ЗАДАНИЕ';
    break

    case 'удалить':                               // удалить существующее задание
    case 'удалить задание':
    	strvoice("какое задание удалить?");
    	editjob = 'удалить';
    	modaltitle = 'УДАЛИТЬ ЗАДАНИЕ';
    break

    case 'сохранить':
    case 'да':
      //----------------------------------------------------------------
      // ПОДТВЕРЖДЕНИЕ ПРИ ВЫХОДЕ ИЗ МОДАЛЬНОГО ОКНА 
      //----------------------------------------------------------------
      switch (modaltitle) {
        case 'ЗАКРЫТЬ ПРОГРАММУ':
          dbsaveJob();
          //open(location, '_self').close();
          window.close();
        break
        case "НОВОЕ ЗАДАНИЕ":
          if (today.value !== "" && job.value !== "") {
            addRowTable("0", today.value, job.value );
          } else {
            //----------------------------------------------------------------
            // НЕТ ДАТЫ ИЛИ ТЕКСТА ЗАДАНИЯ
            //----------------------------------------------------------------
            soundClick();
            document.getElementById('errModal').className = 'errmodal';
            document.getElementById('errModal').style.display = "block";
            modaltitle = 'ВНИМАНИЕ !!!';
            errmodalopen = true;
          }
        break
        case "ИЗМЕНИТЬ ЗАДАНИЕ":
          var trStroka = document.getElementById('myTable').getElementsByTagName('tr'); // получить массив всех строк
          var tdStroka = trStroka[nomerstroki].getElementsByTagName('td');  // получить массив всех колонок в строке
          tdStroka[1].innerHTML = document.getElementById("today").value;   // заменить дату
          tdStroka[2].innerHTML = document.getElementById("job").value;     // заменить задание
        break
        case "УДАЛИТЬ ЗАДАНИЕ":
          document.getElementById("myTable").deleteRow(nomerstroki);
        break
      } // switch (modaltitle)
      if (!errmodalopen) {
        modal.className = 'modal-out';                  // поменять класс на <Закрытие модального окна>
        today.removeAttribute('readonly');
        job.removeAttribute('readonly'); 
        editjob = "";
        modaltitle = "";
      }
    break

  	case 'интернет':
  		strvoice("Скажите, что искать");
  		editjob = "okgoogle";
  	break

    case 'закрыть':
    case 'выход':
    case 'нет':
      switch (modaltitle) {
        case 'ЗАКРЫТЬ ПРОГРАММУ':
          window.close();
          //open(location, '_self').close();
        break
        case 'НОВОЕ ЗАДАНИЕ':
  	    case 'ИЗМЕНИТЬ ЗАДАНИЕ':
  	    case 'УДАЛИТЬ ЗАДАНИЕ':
  	     	modal.className = 'modal-out';                  // поменять класс на <Закрытие модального окна>
  	      editjob = "";
          modaltitle = "";
  	    break
        case 'ВНИМАНИЕ !!!':
  	      errmodalopen = false;
  	      document.getElementById('errModal').className = 'errmodal-out'; // закрыть окно с ошибками
  	      job.focus();                                    // установить фокус ввода в поле <НОВОЕ ЗАДАНИЕ>
  	      modaltitle = 'НОВОЕ ЗАДАНИЕ';
  	    break
      }
    break
	
    default:
      switch (editjob) {
        //----------------------------------------------------------------
  	    // НОВОЕ ЗАДАНИЕ
  	    //----------------------------------------------------------------
        case 'новое':
        console.log('111');
          editjob = "newjob";
          today.valueAsDate = new Date();
          job.value = "";
          job.focus();
          modaltitle = 'НОВОЕ ЗАДАНИЕ';
          modalblock (modal, modaltitle, 'СОХРАНИТЬ');
        break
        //----------------------------------------------------------------
        // ИЗМЕНИТЬ ИЛИ УДАЛИТЬ ВЫБРАННОЕ ЗАДАНИЕ
        //----------------------------------------------------------------
      	case 'изменить':
    		case 'удалить':
          var onend = false;                                      // если что то нашли, то = true
        	var trStroka = document.getElementById('myTable').getElementsByTagName('tr');   // получить массив всех строк
           	for (nomerstroki=1; nomerstroki<trStroka.length; nomerstroki++) {     // цикл по количеству строк в таблице
    	         var tdStroka = trStroka[nomerstroki].getElementsByTagName('td');// получить массив всех колонок в строке
    	         var newjob = (tdStroka[2].innerHTML).toLowerCase();
    	         if ( newjob.indexOf(strcommand) !== -1 ) {
                  onend = true;
    	          	today.value = tdStroka[1].innerHTML;            // дата -> в поле "дата"
              		job.value = tdStroka[2].innerHTML;              // задание -> в поле "задание"
          				if (editjob == 'изменить') {
          					job.focus();
          					modalblock (modal, "ИЗМЕНИТЬ ЗАДАНИЕ", "СОХРАНИТЬ");
          					strvoice("скажите новое задание");
          					editjob = "newjob";
          				} else {			
          					modalblock (modal, "УДАЛИТЬ ЗАДАНИЕ", "Да");
          					editjob = "deljob";
          					strvoice("Удалить?");
          				} 
          			break	// выход из for... нашли задание в таблице
          			}
    	        } 
    	        if (!onend) strvoice("нет такого задания");
        	break
        case 'newjob':
        	job.value = strcommand.trim().charAt(0).toUpperCase() + strcommand.trim().substr(1);	// Сделать 1-ю букву заглавной
        	strvoice("Сохранить?");
    		break
    		case 'okgoogle':
    			//window.location = "https://www.google.ru/search?q="+event.results[0][0].transcript;
    			windowmain=window.open('https://www.google.ru/search?q='+strcommand, '_blank');	// открыть страницу в новом окне
    		break
      } // switch (editjob)
    break // default:
  } // switch (strcommand)
} // function voicecommand(strcommand)

