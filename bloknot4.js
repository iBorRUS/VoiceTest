var nomerstroki;                                  // текущая строка в таблице (по которой кликнули)
var editstroka = false;                           // режим редактирования строки
var waitingclick = false;                         // ожидание повторного клика
var errmodalopen = false;                         // открыто окно с ошибками
var timeclick;                                    // интервал ожидания функции "setTimeout"
var target;                                       // где был клик?
var btnCode;                                      // 0 - левая клавиша, 2 - правая клавиша мышки

function bodyclick(){
  target = event.target;                          // где был клик?
  btnCode = event.button;                         // 0 - левая клавиша, 2 - правая клавиша мышки
  
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
  //alert("nomerstroki="+nomerstroki+ "  kod="+kod+ " btnCode="+btnCode+"  tagName="+target.tagName+"  class="+target.className);
  var modal = document.getElementById('myModal'); // указатель на модальное окно с ключевыми фразами
  var today = document.getElementById("today");   // указатель на дату в строке с заданием
  var job = document.getElementById("job");       // указатель на задание
  document.getElementById("mytbody").contentEditable = "false"; // запретить изменения в таблице

  switch (target.tagName) { 
    //----------------------------------------------------------------
    // КЛИКНУЛИ ПО СТРОКЕ ТАБЛИЦЫ
    //----------------------------------------------------------------
    case 'TD':
      if (!editstroka) {
        nomerstroki = target.parentNode.rowIndex;       // номер строки по которой кликнули
        var trStroka = document.getElementById('myTable').getElementsByTagName('tr');   // получить массив всех строк
        var tdStroka = trStroka[nomerstroki].getElementsByTagName('td');    // получить массив всех колонок в строке
        today.value = tdStroka[1].innerHTML;            // дата -> в поле "дата"
        job.value = tdStroka[2].innerHTML;              // задание -> в поле "задание"

        switch (kod) {
        //----------------------------------------------------------------
        // ИЗМЕНИТЬ ВЫБРАННУЮ СТРОКУ (dblclick левой клавишей)
        //----------------------------------------------------------------
          case 1:                                    
            if (target.cellIndex >0){                         // если не check box, то "ИЗМЕНИТЬ ЗАДАНИЕ"
              job.focus();
			  document.getElementById('recjob').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
              modalblock (modal, "ИЗМЕНИТЬ ЗАДАНИЕ", "ИЗМЕНИТЬ");
            }
          break
          //----------------------------------------------------------------
          // ВВОД НОВОГО ЗАДАНИЯ (dblclick правой клавишей)
          //----------------------------------------------------------------
          case 2: 
              today.valueAsDate = new Date();
              job.value = "";
              job.focus();                                    // установить фокус ввода в поле <НОВОЕ ЗАДАНИЕ>
              modalblock (modal, "НОВОЕ ЗАДАНИЕ", "СОХРАНИТЬ");
          break
          //----------------------------------------------------------------
          // ПРОИЗНЕСТИ ЗАДАНИЕ (click левой клавишей)
          //----------------------------------------------------------------
          case 3:
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(tdStroka[2].innerHTML));
          break
          //----------------------------------------------------------------
          // УДАЛИТЬ ВЫБРАННУЮ СТРОКУ (click правой клавишей)
          //----------------------------------------------------------------
          case 4:
            today.setAttribute('readonly', 'readonly');     // запретить изменения в строке "дата"
            job.setAttribute('readonly', 'readonly');       // запретить изменения в строке "задание"
            modalblock (modal, "УДАЛИТЬ ЗАДАНИЕ", "УДАЛИТЬ");
          break
        }
      } // if (!editstroka)
    break
    default:
      switch (target.id) {
        case 'closemodal':
        case 'closeerrmodal':
          switch (target.className) {
            case 'close':
              modal.className = 'modal-out';                  // поменять класс на <Закрытие модального окна>
              today.removeAttribute('readonly');
              job.removeAttribute('readonly'); 
              editstroka = false;                             // отлючить режим редактирования строки
            case 'errclose':
              errmodalopen = false;
              document.getElementById('errModal').className = 'errmodal-out'; // закрыть окно с ошибками
              job.focus();                                    // установить фокус ввода в поле <НОВОЕ ЗАДАНИЕ>
            break
          }
          editstroka = false;                             // отлючить режим редактирования строки
        break
        case 'okbutton':
        case 'ok':
        //----------------------------------------------------------------
        // ПОДТВЕРЖДЕНИЕ ПРИ ВЫХОДЕ ИЗ МОДАЛЬНОГО ОКНА 
        //----------------------------------------------------------------
          switch (document.getElementById("modal-title").innerHTML) {
            case "НОВОЕ ЗАДАНИЕ":
              if (today.value !== "" && job.value !== "") {
                addRowTable(-1, "0", today.value, "00:00", job.value );
              } else {
                //----------------------------------------------------------------
                // НЕТ ДАТЫ ИЛИ ТЕКСТА ЗАДАНИЯ
                //----------------------------------------------------------------
                soundClick();
                document.getElementById('errModal').className = 'errmodal';
                document.getElementById('errModal').style.display = "block";
                errmodalopen = true;
              }
            break
            case "ИЗМЕНИТЬ ЗАДАНИЕ":
            //alert(nomerstroki);
              var trStroka = document.getElementById('myTable').getElementsByTagName('tr'); // получить массив всех строк
              var tdStroka = trStroka[nomerstroki].getElementsByTagName('td');  // получить массив всех колонок в строке
              tdStroka[1].innerHTML = document.getElementById("today").value;   // заменить дату
              tdStroka[2].innerHTML = document.getElementById("job").value;     // заменить задание
            break
            case "УДАЛИТЬ ЗАДАНИЕ":
              document.getElementById("myTable").deleteRow(nomerstroki);
            break
          }
          if (!errmodalopen) {
            modal.className = 'modal-out';                  // поменять класс на <Закрытие модального окна>
            today.removeAttribute('readonly');
            job.removeAttribute('readonly');
            editjob = ""; 
          }
          editstroka = false;                             // отлючить режим редактирования строки
        break        
        //----------------------------------------------------------------
        // СОХРАНИТЬ ТАБЛИЦУ НА ДИСКЕ 
        //----------------------------------------------------------------
        case 'buttontopsavetabl':     
          dbsaveJob();
        break
      } // switch (target.id)
    break // default:
  } // switch (target.tagName)
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
var addRowTable = function(nrow, textCheck, textDate, textTimes, textZadaniya) { 
    var tableRef = document.getElementById("myTable").getElementsByTagName('tbody')[0];
    if (nrow == -1) nrow = tableRef.rows.length;			// Вставить строку в конец таблицы
    var newRow = tableRef.insertRow(nrow);  				// Вставить строку в тело таблицы
    var newCell0  = newRow.insertCell(0);                   // Создать пустые ячейки в добавленной строке
    var newCell1  = newRow.insertCell(1);
    var newCell2  = newRow.insertCell(2);
    var newCell3  = newRow.insertCell(3);
    var newCheck = document.createElement('input');         // новая переменная для checkbox
    newCheck.type = 'checkbox';                                  
    if (textCheck == '1') {newCheck.checked = true;} else {newCheck.checked = false;} // указать тип переменной
    newCell0.appendChild(newCheck);                         // добавить 1-ю ячейку в новую стоку
    var newDate  = document.createTextNode(textDate);       // присвоить переменной новую дату 
    newDate.type = 'date';
    newCell1.appendChild(newDate);                          // добавить 2-ю ячейку в новую стоку с новой датой
    var newText  = document.createTextNode(textTimes);      // присвоить переменной новое время
    newCell2.appendChild(newText);                          // добавить 3-ю ячейку в новую стоку с новым временем
    var newText  = document.createTextNode(textZadaniya);   // присвоить переменной новое задание
    newCell3.appendChild(newText);                          // добавить 4-ю ячейку в новую стоку с новым заданием
}     

//----------------------------------------------------------------
// ВКЛЮЧИТЬ ЗВУК ПРИ ОТКРЫТИИ ОКНА С ОШИБКОЙ 
//----------------------------------------------------------------                                                    
function soundClick() {
  var audio = new Audio(); // Создаём новый элемент Audio
  audio.src = 'hahaha.mp3'; // Указываем путь к звуку "клика"
  audio.autoplay = true; // Автоматически запускаем
}


