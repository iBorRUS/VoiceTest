var nomerstroki;                                  // текущая строка в таблице (по которой кликнули)
var strtabljob;									                  // строка задания в таблице (по клику)
var editstroka = false;                           // режим редактирования строки
var waitingclick = false;                         // ожидание повторного клика
var timeclick;                                    // интервал ожидания функции "setTimeout"
var target;                                       // где был клик?
var btnCode;                                      // 0 - левая клавиша, 2 - правая клавиша мышки
var selectjob = 0;								                // просроченные задания

//-------------------------------------------------------------------
//    АВТОЗАГРУЗКА 
//-------------------------------------------------------------------
window.onload = function(){
  dbopenJob();
  setTimeout(function(){
    if(selectjob) {
    document.getElementById('errmodaltext').innerHTML = "Найдено "+selectjob+" не выполненных задания"
    document.getElementById('errModal').className = 'errmodal';
    document.getElementById('errModal').style.display = "block";
    modaltitle = "";
    //modaltitle = 'ВНИМАНИЕ !!!';
    }
  }, 500);
}

function bodyclick(){
  target = event.target;                          // где был клик?
  btnCode = event.button;                         // 0 - левая клавиша, 2 - правая клавиша мышки

  if (target.tagName == 'TD'){ 
      nomerstroki = target.parentNode.rowIndex;   // номер строки, по которой кликнули
      strtabljob = target.parentNode.getElementsByTagName('td');  // массив колонок в строке, по которой кликнули
  }

  if (!waitingclick) {                            // был первый клик
    waitingclick = true;                          // запомнить паузу между кликами (ждем возможного 2-го клика)
    timeclick = setTimeout( function(){ if (btnCode==2) {myevent(4);} else {myevent(3);}; waitingclick=false; clearTimeout(timeclick); }, 280);
  } else {                                        // второй клик с интервалом < 280 мсек т.е. АНАЛОГ "dblclick"                      
    clearTimeout(timeclick); 
    waitingclick = false;
    if (btnCode == 0) {myevent(1);} else {myevent(2);}
  }
}

function myevent(kod) {

  switch (target.id) {
  /*
    case 'dtins' :
      voicecommand("добавить");
    break
    case 'dtedit' :
      voicecommand("изменить");
    break
    case 'dtdel' :
      voicecommand("удалить");
    break
    case 'dtststus' :
      voicecommand("статус");
    break
    case 'dtcopy' :
      voicecommand("копия");
    break
    case 'dtclose' :
      window.close();
    break
    //----------------------------------------------------------------
    // СОХРАНИТЬ ТАБЛИЦУ НА ДИСКЕ 
    //----------------------------------------------------------------
    case 'dtsavetable':     
      dbsaveJob();
    break
  */
    case 'closemodal':
    case 'closeerrmodal':
    case 'closemodaldate':
      switch (target.className) {
        case 'close':
          document.getElementById('myModal').className = 'modal-out';     // поменять класс на <Закрытие модального окна>
        case 'errclose':
          document.getElementById('errModal').className = 'errmodal-out'; // закрыть окно с ошибками
        break
        case 'closedate':
          document.getElementById('myModaldate').className = 'modal-out';     // поменять класс на <Закрытие модального окна>
      }
      tdmiganie();
      modaltitle = "";
    break
    case 'okbutton':
      voicecommand("да");
    break

    default :

      switch (target.tagName) {
        //----------------------------------------------------------------
        // КЛИКНУЛИ ПО СТРОКЕ ТАБЛИЦЫ
        //----------------------------------------------------------------
        case 'TD':	  
		      voicecommand(strtabljob[3].innerHTML.trim().toLowerCase());     
        break
      }
    break
  }
} // function myevent(kod)


function modalblock (modal, title, okbutton) {
  editstroka = true;
  document.getElementById("modal-title").innerHTML = title; // заголовок модального окна
  document.getElementById("okbutton").innerHTML = okbutton; // заголовок подтверждения изменения
  modal.className = 'modal';                                // поменять класс на первоначальный
  modal.style.display = "block";                            // показать окно на экране 
}

//----------------------------------------------------------------
// добавить строку в таблицу на экране
//----------------------------------------------------------------
var addRowTable = function(table, nrow, textCheck, textDate, textTimes, textZadaniya) { 
    var tableRef = document.getElementById(table).getElementsByTagName('tbody')[0];
    if (nrow == -1) nrow = tableRef.rows.length;			      // Вставить строку в конец таблицы
    var newRow = tableRef.insertRow(nrow);  				        // Вставить строку в тело таблицы
    var newCell0  = newRow.insertCell(0);                   // Создать пустые ячейки в добавленной строке
    var newCell1  = newRow.insertCell(1);
    var newCell2  = newRow.insertCell(2);
    var newCell3  = newRow.insertCell(3);
    var newCheck  = document.createElement('input');        // новая переменная для checkbox
    newCheck.onchange = function(){ click_checkbox(this); } // кликнули checkbox
    newCheck.type = 'checkbox';
    newCheck.className ='checkclass'; 
    textCheck == '1' ? newCheck.checked = true : newCheck.checked = false;  // указать тип переменной
    newCell0.appendChild(newCheck);                         // добавить 1-ю ячейку в новую стоку
    var newDate  = document.createTextNode(textDate);       // присвоить переменной новую дату 
    newDate.type = 'date';
    newCell1.appendChild(newDate);                          // добавить 2-ю ячейку в новую стоку с новой датой
    var newText  = document.createTextNode(textTimes);      // присвоить переменной новое время
    newCell2.appendChild(newText);                          // добавить 3-ю ячейку в новую стоку с новым временем
    var newText  = document.createTextNode(textZadaniya);   // присвоить переменной новое задание
	  newCell3.appendChild(newText);                          // добавить 4-ю ячейку в новую стоку с новым заданием
    if ( !newCheck.checked && twodates(textDate) == 1 ) {
		selectjob ++;										                        // подсчет просроченных заданий
		newRow.style.background="#ff6347";					            // выделить не выполненное задание
	}
}     

function click_checkbox(ev) {
    var checkstat = ev.parentNode.parentNode.getElementsByTagName('input');
    var strdate = ev.parentNode.parentNode.getElementsByTagName('td');
    if (checkstat[0].checked && twodates(strdate[1].innerHTML) == -1) { 
      strvoice("Рано. Событие ещё не произошло!");
      checkstat[0].checked = false;
    } else {
      if ( !checkstat[0].checked && twodates(strdate[1].innerHTML) == 1 ) {
        ev.parentNode.parentNode.style.background="#ff6347";            // выделить не выполненное задание
      } else { ev.parentNode.parentNode.style.background="#ffffff"; }   // снять выделение
    }
}

//----------------------------------------------------------------
// ВКЛЮЧИТЬ ЗВУК ПРИ ОТКРЫТИИ ОКНА С ОШИБКОЙ 
//----------------------------------------------------------------                                                    
function soundClick() {
  var audio = new Audio();  // Создаём новый элемент Audio
  audio.src = 'hahaha.mp3'; // Указываем путь к звуку "клика"
  audio.autoplay = true;    // Автоматически запускаем
}


