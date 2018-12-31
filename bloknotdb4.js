//-----------------------------------------------------------------------------
//      ИСХОДНЫЕ ДАННЫЕ ДЛЯ СОЗДАНИЯ ТАБЛИЦЫ БД
//-----------------------------------------------------------------------------
var myname;
var mypassword;
var shortName = 'mydiary';  // Мой ежедневник
var version = '1.0';
var displayName = 'My Database Diary';
var maxSize = 65536; 
var db = openDatabase(shortName, version, displayName, maxSize);

if(!db){alert("ОШИБКА. НЕТ СВЯЗИ С БАЗОЙ ДАННЫХ !!!"); createTables(db);}

db.transaction(function (transaction) {
transaction.executeSql(
     'SELECT * FROM mydiary',[],null,
        function(){                     // нет данных то в базе, наверно она пустая
            createTables(db);           // Создать новую таблицу в БД
    });
});

//-----------------------------------------------------------------------------
//      СОЗДАТЬ ТАБЛИЦУ БД (если её нет на диске)
//-----------------------------------------------------------------------------
function createTables(db){
    db.transaction(
        function (transaction) {
            transaction.executeSql('CREATE TABLE mydiary (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, db_check TEXT NOT NULL DEFAULT "0", db_data TEXT NOT NULL DEFAULT "//", db_job TEXT NOT NULL DEFAULT "Новое задание");', [], nullDataHandler, errorHandler);
        }
    );
}

//-----------------------------------------------------------------------------
//      ОТКРЫТЬ ТАБЛИЦУ БД ДЛЯ ПРОСМОТРА (автозагрузка с диска)
//-----------------------------------------------------------------------------
function dbopenJob(){
    db.transaction(function (transaction) { 
        transaction.executeSql('SELECT * from mydiary', [], function (transaction, results) { 
            var len = results.rows.length, i, row; 
            if (len > 0) {
                row = results.rows.item(0);
                myname = row['db_job']; mypassword = row['db_data'];
                for (i = 1; i < len; i++) { 
                    row = results.rows.item(i);
                    addRowTable(row['db_check'], row['db_data'], row['db_job']); // добавить строку в таблицу
                } 
                //nomerstroki = len;
            } else {
                dbinsJob("0", "2563", "Игорь");             // создается новая таблица в базе данных
                alert("СОЗДАНА НОВАЯ ТАБЛИЦА В БАЗЕ ДАННЫХ !");
            }
        }, null); 
    }); 
}

//-----------------------------------------------------------------------------
//      ВСТАВИТЬ НОВУЮ СТРОКУ В ТАБЛИЦУ БД
//-----------------------------------------------------------------------------
function dbinsJob(newcheck, newdata, newjob){
    db.transaction(
        function (transaction) {
            transaction.executeSql('insert into mydiary (db_check, db_data, db_job) VALUES (?, ?, ?)', [newcheck, newdata, newjob], nullDataHandler, errorHandler);
        //alert(newjob);
		}
    );
}

//-----------------------------------------------------------------------------
//      СОХРАНИТЬ ТАБЛИЦУ БД
//-----------------------------------------------------------------------------
function dbsaveJob(){
    var trStroka = document.getElementById('myTable').getElementsByTagName('tr');   // получить массив всех строк
    if (trStroka.length <= 1) {
        alert('ОШИБКА - НЕТ ЗАПИСЕЙ В ТАБЛИЦЕ !!!');
        dbinsJob("0", "2563", "Игорь");
    } else {
        db.transaction(                                                     // Удалить все старые записи
            function(transaction){
                transaction.executeSql("DELETE FROM mydiary", [], nullDataHandler, errorHandler);
            }
        );
        dbinsJob("0", mypassword, myname);                                  // в 1-ю запись -> пароль и имя пользователя
        for (var i=1;i<trStroka.length;i++)                                 // цикл по количеству строк в таблице
        {                                                                   //          0-я строка - это заголовок
            var tdStroka = trStroka[i].getElementsByTagName('td');          // получить массив всех колонок в строке
            var td = trStroka[i].querySelectorAll("td")[0];                 // Берем 1-ю ячейку в строке
            var checkbox = td.querySelector("input[type='checkbox']");      // Берем чекбокс
            if (checkbox.checked) {                                         // Если чекбок с галоччкой (отмечен)
                newcheck="1";      // чекбокс выбран                        
            } else {
                newcheck="0";      // чекбокс не выбран
            };
            var newdata = tdStroka[1].innerHTML;
            var newjob = tdStroka[2].innerHTML;
            dbinsJob(newcheck, newdata, newjob);
        } 
    }
    strvoice(("Сохранили "+(trStroka.length-1)+" заданий"));
}

//-----------------------------------------------------------------------------
//      ОБРАБОТКА ОШИБОК (прерываний при обращении к таблице)
//-----------------------------------------------------------------------------
function nullDataHandler(transaction, results) { }

function errorHandler(transaction, error){
    alert('Обнаружена ошибка '+error.message+' (Code '+error.code+')');
    var we_think_this_error_is_fatal = true;
    if (we_think_this_error_is_fatal) return true;
    return false;
}
