var windowmain;                                     // указатель на окно с открытым приложением
var modaltitle = "";								// Заголовок текущего окна
var editjob = "";									// изменение, удаление задания
var speech = new SpeechSynthesisUtterance();        // Возвращает новый экземпляр объекта т.е. включает динамики (массив)
	speech.lang = 'ru-Ru';                          // Язык для диктовки текста
var voicestart = false;                             // флаг 1-го включения микрофона
var recognizer = new webkitSpeechRecognition();   	// Создаем распознаватель
var recognizing = false;
recognizer.interimResults = true;                 	// true = распознавание началось ещё до того, как пользователь закончит говорить
recognizer.lang = 'ru-Ru';                        	// Язык для распознования
recognizer.continuous = true;                     	// когда пользователь прекратил говорить, распознование не закончилось

function speechmic () {                             // Включаем микрофон
  document.getElementById('micbutton').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
  if (!voicestart) strvoice("Произнесите команду."); voicestart = true;
  recognizer.start();
}
//-----------------------------------------------------------------------------------------------
speech.onstart = function() {                       // когда идет текст, 
  recognizer.stop();                                //                  отключить микрофн
  recognizing = false;                              //
}                                                   
speech.onend = function() {                         // когда текст закончился, 
  if (!recognizing) recognizer.start();             //                        включить микрофон
  recognizing = true;                               //
}
//-----------------------------------------------------------------------------------------------

recognizer.onresult = function (event) {            // Вызывается если результат — слово или фраза были распознаны положительно
  var result = event.results[event.resultIndex];    // содержит все данные, связанные с конечным результатом распознавания речи
  if (result.isFinal) {                             // результат является окончательным
    voicecommand((result[0].transcript).trim().toLowerCase());	// удалиь пробелы слева и справа, все буквы - мленькие
  } 
}

recognizer.onstart = function(){                    // вллючился микрофон
  //document.getElementById('micbutton').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
  //if (!voicestart) strvoice("Приветствую вас, " + myname);
  //if (!voicestart) strvoice("Произнесите команду."); voicestart = true;
}

recognizer.onend = function(){                      // Закончилось время ожидания (примерно 15 сек)
  if (recognizing) { 
    strvoice("Я жду команду");
    recognizer.start();
  }
}
//----------------------------------------------------------------
// ПРОИЗНЕСТИ КОМАНДУ 
//----------------------------------------------------------------
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
    //--------------------------------------------------------------------
    // АНАЛИЗ ОСНОВНЫХ КОМАНД (команды первого уровня)
    //--------------------------------------------------------------------
    case 'выше':
      window.scrollBy(0,-200);                    // прокрутка окна вниз
    break
    case 'ниже':                                  // прокрутка окна вверх
      window.scrollBy(0,200);
    break
    case 'закрыть программу':
      modaltitle = 'ЗАКРЫТЬ ПРОГРАММУ';
      strvoice("Сохранить данные?");
    break
    case 'сохранить таблицу':                     // СОХРАНИТЬ ТАБЛИЦУ НА ДИСКЕ
       dbsaveJob();
    break
	
    case 'добавить':                              // ВВОД НОВОГО ЗАДАНИЯ
      tdmiganie();
      editjob = 'новое';
      strcommand="";
	  document.getElementById('dtins').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
      voicecommand(strcommand);
    break
	
    case 'изменить':                              // изменить существующее задание
    tdmiganie();
      strvoice("какое задание изменить?");
      editjob = 'изменить';
      modaltitle = 'ИЗМЕНИТЬ ЗАДАНИЕ';
    document.getElementById('dtedit').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
    break

    case 'копия':                              // копировать существующее задание
    tdmiganie();
      strvoice("какое задание копировать?");
      editjob = 'копия';
      modaltitle = 'НОВОЕ ЗАДАНИЕ';
    document.getElementById('dtcopy').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
    break

    case 'удалить':                               // удалить существующее задание
		tdmiganie();
    	strvoice("какое задание удалить?");
    	editjob = 'удалить';
    	modaltitle = 'УДАЛИТЬ ЗАДАНИЕ';
		document.getElementById('dtdel').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
    break

    case 'статус':                               // удалить существующее задание
    	strvoice("назовите задание.");
    	editjob = 'статус';
		document.getElementById('dtststus').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
    break

    case 'сохранить':
    case 'да':
      //----------------------------------------------------------------
      // ПОДТВЕРЖДЕНИЕ ПРИ ВЫХОДЕ ИЗ МОДАЛЬНОГО ОКНА 
      //----------------------------------------------------------------
      switch (modaltitle) {
        case 'ЗАКРЫТЬ ПРОГРАММУ':
          dbsaveJob();
          errmodalopen = true;                              // не показывать закрытие модальных окон (не красиво смотриться)
          setTimeout( function(){ window.close()}, 3000);   // Задержка 3сек. для озвучки сообщения о записи на диск 
        break
        case "НОВОЕ ЗАДАНИЕ":
          if (today.value !== "" && job.value !== "") {
          	sortbydate("0", today.valueAsDate, job.value);
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
          document.getElementById("myTable").deleteRow(nomerstroki);
          sortbydate("0", document.getElementById("today").valueAsDate, document.getElementById("job").value);	  
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
		tdmiganie();
      }
    break

  	case 'интернет':
  		strvoice("Скажите, что искать");
  		editjob = "okgoogle";
		document.getElementById('dtenet').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
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
		  tdmiganie();
  	    break
        case 'ВНИМАНИЕ !!!':
  	      errmodalopen = false;
  	      document.getElementById('errModal').className = 'errmodal-out'; // закрыть окно с ошибками
  	      job.focus();                                    // установить фокус ввода в поле <НОВОЕ ЗАДАНИЕ>
  	      modaltitle = 'НОВОЕ ЗАДАНИЕ';
  	    break
      }
    break
    //--------------------------------------------------------------------
    // АНАЛИЗ НЕ ОСНОВНЫХ КОМАНД (команды второго, третьего и ... уровней)
    //--------------------------------------------------------------------
    default:
      switch (editjob) {
        //----------------------------------------------------------------
  	    // ВВОД НОВОГО ЗАДАНИЯ
  	    //----------------------------------------------------------------
        case 'новое':
            editjob = "newjob";
            today.valueAsDate = new Date();
            modaltitle = 'НОВОЕ ЗАДАНИЕ';
            job.value = "";
            job.focus();
			      document.getElementById('recjob').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
            modalblock (modal, modaltitle, 'СОХРАНИТЬ');
        break
        //----------------------------------------------------------------
        // ИЗМЕНИТЬ ИЛИ УДАЛИТЬ ВЫБРАННОЕ ЗАДАНИЕ
        //----------------------------------------------------------------
        case 'изменить':
        case 'удалить':
    		case 'статус':
        case 'копия':
          var onend = false;                                      // если что то нашли, то = true
        	var trStroka = document.getElementById('myTable').getElementsByTagName('tr');   // получить массив всех строк
           	//for (nomerstroki=1; nomerstroki<trStroka.length; nomerstroki++) {     // цикл по количеству строк в таблице
            for (nomerstroki=trStroka.length-1; nomerstroki>0; nomerstroki--) {     // цикл по количеству строк в таблице
    	         var tdStroka = trStroka[nomerstroki].getElementsByTagName('td');// получить массив всех колонок в строке
    	         var newjob = (tdStroka[2].innerHTML).toLowerCase();
    	         if ( newjob.indexOf(strcommand) !== -1 ) {
                  onend = true;
                  	var str = tdStroka[1].innerHTML.split('.');             // разделить строку даты на массив день-месяц-год
    	          	today.value = str[2]+"-"+str[1]+"-"+str[0];				// tdStroka[1].innerHTML;            // дата -> в поле "дата"
              		job.value = tdStroka[2].innerHTML;              // задание -> в поле "задание"
					
					switch (editjob) {
						case 'изменить':
						  job.focus();
          		modalblock (modal, "ИЗМЕНИТЬ ЗАДАНИЕ", "СОХРАНИТЬ");
          		editjob = "newjob";
							document.getElementById('recjob').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
						break
            case 'копия':
              job.focus();
              modalblock (modal, "ИЗМЕНИТЬ ЗАДАНИЕ", "СОХРАНИТЬ");
              editjob = "newjob";
              document.getElementById('recjob').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
            break
						case 'удалить':
						  modalblock (modal, "УДАЛИТЬ ЗАДАНИЕ", "Да");
          		editjob = "deljob";
          		strvoice("Удалить?");
						break
						case 'статус':
							var checkstat = tdStroka[0].getElementsByTagName('input');
						  checkstat[0].checked = !(checkstat[0].checked);
          		editjob = "";
          		strvoice("Задание отмечено");
							document.getElementById('dtststus').classList.remove("miganie");
						break
					}						
          			break	// выход из for... нашли задание в таблице
				  }	// if ( newjob.indexOf(strcommand) !== -1 )
    	        }	// for (nomerstroki=1;
    	        if (!onend) strvoice("нет такого задания");
        	break
        case 'newjob':
          switch (strcommand) {
            case 'изменить дату':
              strvoice("скажите новую дату");
              editjob='newdate';
              strcommand="";
      			  document.getElementById('recdate').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
      			  document.getElementById('recjob').classList.remove("miganie");
            break
            //case 'изменить задание':
            //  strvoice("скажите новое задание");
            //  editjob = "newjob";
            //break
            default:
              job.value = strcommand.trim().charAt(0).toUpperCase() + strcommand.trim().substr(1);  // Сделать 1-ю букву заглавной
              //strvoice("Сохранить?");
          }
    		break
        //----------------------------------------------------------------
        // ВВОД НОВООЙ ДАТЫ
        //----------------------------------------------------------------
        case 'newdate':
          today.valueAsDate = formatDate(strcommand);
          editjob = "newjob";                             // вернуться в окно редактирования задания
		  document.getElementById('recjob').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
		  document.getElementById('recdate').classList.remove("miganie");
        break
        //----------------------------------------------------------------
        // ОТКРЫТЬ НОВОЕ ОКНО В goodle со сказанной строкой
        //----------------------------------------------------------------
    	case 'okgoogle':
    		//window.location = "https://www.google.ru/search?q="+event.results[0][0].transcript;
    		windowmain=window.open('https://www.google.ru/search?q='+strcommand, '_blank');	// открыть страницу в новом окне
    	break
      } // switch (editjob)
    break // default:
  } // switch (strcommand)
} // function voicecommand(strcommand)

function formatDate(strdate) {
  var str = strdate.split(' ');             // разделить строку даты на массив день-месяц-год                      //                                   0    1     2
  switch (str[1].substring(0,3)) {          // поиск по первым трем символам названия месяца
    case "янв": nmonth=0; break;
    case "фев": nmonth=1; break;
    case "мар": nmonth=2; break;
    case "апр": nmonth=3; break;
    case "мая": nmonth=4; break;
    case "июн": nmonth=5; break;
    case "июл": nmonth=6; break;
    case "авг": nmonth=7; break;
    case "сен": nmonth=8; break;
    case "окт": nmonth=9; break;
    case "ноя": nmonth=10; break;
    case "дек": nmonth=11; break;
  }
  var newdate = new Date();                 // установить новую СКАЗАННУЮ дату
  newdate.setDate(str[0]);                  // день
  newdate.setMonth(nmonth);                 // месяц
  if (str.length <3) { newdate.setFullYear(newdate.getFullYear()); }
  	else { newdate.setFullYear(str[2]); }   // полный год     
  if (str[0] != newdate.getDate()) { strvoice("Ошибка в дате."); }
  return (newdate);                         // вернуть новую дату
}

function sortbydate(textCheck, textDate, textZadaniya) {
	var trStroka = document.getElementById('myTable').getElementsByTagName('tr');   // получить массив всех строк
	var den, nmonth, yr;
    for ( var nrow = trStroka.length-1; nrow>0; nrow--) {    	// цикл по количеству строк в таблице (начиная с последней записи и до 1-й)
      var tdStroka = trStroka[nrow].getElementsByTagName('td');	// получить массив всех колонок в строке
      console.log('2 nrow ='+ nrow +" tdStroka[1].innerHTML= "+tdStroka[1].innerHTML);
      var str = tdStroka[1].innerHTML.split('.');             	// разделить строку даты на массив день-месяц-год
      var newdate = new Date();     		// установить новую дату (из строки таблицы)
	  newdate.setDate(str[0]);            	// день
	  newdate.setMonth(str[1]-1);         	// месяц
	  newdate.setFullYear(str[2]);        	// полный год
      if ( newdate < textDate ) {	
    	break
      }
    }
    addRowTable(nrow, textCheck, textDate.toLocaleDateString(), textZadaniya);
	//addRowTable(nrow, textCheck, textDate.getFullYear()+'-'+('0'+(textDate.getMonth()+1)).slice(-2)+'-'+('0'+textDate.getDate()).slice(-2)
//, textZadaniya);	// slice(-2) - извлечёт два последних элемента последовательности

}

function tdmiganie() {
	document.getElementById('recjob').classList.remove("miganie");
	document.getElementById('dtins').classList.remove("miganie");
	document.getElementById('dtedit').classList.remove("miganie");
	document.getElementById('dtdel').classList.remove("miganie");
	document.getElementById('dtenet').classList.remove("miganie");
	document.getElementById('dtststus').classList.remove("miganie");
  document.getElementById('dtcopy').classList.remove("miganie");
}
