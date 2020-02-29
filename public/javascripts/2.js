  window.onload=function () {
      document.querySelector('#ip').onclick = function () {
        ajaxGet();
      },
      document.querySelector('#mysql').onclick = function () {
        proxy_mysql();
      },
      document.querySelector('#ost_show').onclick = function () {
        ost_show();
      },
      document.querySelector('#bus').onclick = function () {
        bus_show();
      },
      document.querySelector('#tram').onclick = function () {
        tram_show();
      },
      document.querySelector('#troll').onclick = function () {
        troll_show();
      },
      document.querySelector('#visit').onclick = function () {
        proverka();
      },
      document.querySelector('#prognoz').onclick = function () {
        prognoz();
      }//не доделанный поиск маршрута по номеру
    //  document.querySelector('#poisk').onclick = function () {
    //    poisk();
    //  }
 /*var req = new XMLHttpRequest();
      req.onreadystatechange= function(){
          if(req.readyState == 4){
           return true;
         }}
         req.open('GET','/print_mysql_marsh');
         req.send();*/
   }
  var increment = 0.000001;//шаг с которым будет двигаться маркет транспорта
  var name =[];//номер транпорта
  var lat=[];//координата транпорта
  var lon=[];//координата транпорта
  var oldlat= new Array(200, 0);//прошлая координата транпорта
  var oldlon= new Array(200, 0);//прошлая координата транпорта
  var rtype=[];//{'Т','А','Тр'}
  var map,
      myIcon,
      myDivIcon,
      marker;

  function ajaxGet() {

     var req = new XMLHttpRequest();
     req.onreadystatechange= function(){ //статус готовности запроса
         if(req.readyState == 4){
            //document.querySelector('#myip').innerHTML = req.responseText;
            //сохранение широты и долготы в отдельные переменные
            console.log(JSON.parse(req.responseText));
            var obj = JSON.parse(req.responseText);//перевод в формат json для дальнейжей работы
            for(var i=0; i<obj.anims.length;i++){
              lat[i]=obj.anims[i].lat/1000000-37.530776;
              lon[i]=obj.anims[i].lon/1000000-16.099487;
              rtype[i]=obj.anims[i].rtype;
              name[i]=obj.anims[i].rnum;
            }
            DG.then(function() {
               for(var i=0; i<lat.length;i++){
                 switch (rtype[i]) {
                   case 'Т':
                   myIcon = DG.icon({
                       iconUrl: 'images/troll.png',
                       iconSize: [30, 30]
                   });
                   break;
                   case 'А':
                   myIcon = DG.icon({
                       iconUrl: 'images/bus.png',
                       iconSize: [30, 30]
                   });
                     break;
                   case 'Тр':
                   myIcon = DG.icon({
                       iconUrl: 'images/tram.png',
                       iconSize: [30, 30]
                   });
                   break;
                   default:
                     alert( 'что то пошло не так' );
                   }
                DG.marker([lat[i], lon[i]], {
                    icon: myIcon
                }).addTo(map)
                .bindLabel(obj.anims[i].rnum,{
                  static: true
                });
                myDivIcon = DG.divIcon({
                    iconSize: [52, 17],
                    html: '<b style="color:blue;">HTML-код</b>'
                });
                DG.marker([0, 0], {
                    icon: myDivIcon
                }).addTo(map);
              }
            });
          }
        }
        req.open('GET','/proxy');
        req.send();
      };
//отрисовка карты
   DG.then(function() {
        map = DG.map('map', {
        center: [52.284404, 104.295782],
        zoom: 12
      });

      coordinates = [[52.25514,104.33642],[52.264112,104.31089],[52.27264,104.30552]];
                  /*    // создаем ломаную из массива географических точек
                      polyline = DG.polyline(coordinates, {
                          color: 'blue'
                      }).addTo(map);

                      // подстраиваем центр карты и масштаб, чтобы ломаную было видно
                      map.fitBounds(polyline.getBounds());*/
    });



    function prognoz( ) {
       var req = new XMLHttpRequest();
       req.onreadystatechange= function(){ //статус готовности запроса
         if(req.readyState == 4){
           console.log('да да это оно');
           return true;
         }}
         req.open('GET','/prognoz');
         req.send();
    };

    function proverka( ) {
       var req = new XMLHttpRequest();
       var obj=[];
       req.onreadystatechange= function(){ //статус готовности запроса
         if(req.readyState == 4){
               var obj = JSON.parse(req.responseText);
               var visit=[];
               console.log(obj);
               for(var i=0; i<obj.length;i++){
                 stid[i]=obj[i].stid;
                 stname[i]=obj[i].stname;
                 stlat[i]=obj[i].lat;
                 stlon[i]=obj[i].lon;
                 visit[i]=obj[i].visit;
               }

               DG.then(function() {
               for(var i=0; i<stlat.length;i++){
               myIcon = DG.icon({
                   iconUrl: 'images/ost.png',
                   iconSize: [20, 20]
               });
               DG.marker([stlat[i], stlon[i]], {
                   icon: myIcon
               }).addTo(map);
              /* .bindLabel(' '+obj[i].stid,{
                 static: true
               });*/
               myDivIcon = DG.divIcon({
                   iconSize: [70, 20],
                   html: '<b style="color:blue;">HTML-код</b>'
               });
               DG.marker([54.98, 82.87], {
                   icon: myDivIcon
               }).addTo(map);
             }
           });
           var vremy =[];
           var vremyob =[];
           //расчет времени
           for(var i=1; i<obj.length;i++){
             if(obj[i].stid==obj[i-1].stid){
               vremy[i]=10;
             }
             else{
             vremy[i]=Math.sqrt(Math.pow((obj[i-1].lat-obj[i].lat),2)+Math.pow((obj[i-1].lon-obj[i].lon),2));
             vremy[i]=Math.round(((vremy[i]*111)/20)*60)+1;
             console.log(vremy[i]);
           }
           }
            console.log(vremy);
            vremyob[0]=0
           for(var i=1; i<obj.length;i++){
             vremyob[i]=vremyob[i-1]+vremy[i];
             console.log('через '+vremyob[i]+' минут будет на '+obj[i].stname);
           }
          //  console.log(vremyob);

            //console.log(obj[1].id_ost);

           //console.log(vremyob);
        }
       }

         req.open('GET','/proverka');
         req.send();
    };
//не доделанный поиск маршрута по номеру
    function poisk( ) {
       req.onreadystatechange= function(){ //статус готовности запроса
         if(req.readyState == 4){
          return true;
        }
       }
       req.open('GET','/poisk');
       req.send();
    };
function proxy_mysql( ) {
   var req = new XMLHttpRequest();
   req.onreadystatechange= function(){ //статус готовности запроса
     if(req.readyState == 4){
       return true;
     }}
     req.open('GET','/proxy_mysql_ost');
     req.send();
};

var stid =[];//id остановки
var stname =[''];//имя остановки
var stlat=[];//координата остановки
var stlon=[];//координата остановки

function ost_show( ) {

   var req = new XMLHttpRequest();
      req.onreadystatechange= function(){ //статус готовности запроса
          if(req.readyState == 4){
              var obj = JSON.parse(req.responseText);
              for(var i=0; i<obj.length;i++){
                stid[i]=obj[i].stid;
                stname[i]=obj[i].stname;
                stlat[i]=obj[i].lat;
                stlon[i]=obj[i].lon;
              }
              DG.then(function() {
              for(var i=0; i<stlat.length;i++){
              myIcon = DG.icon({
                  iconUrl: 'images/ost.png',
                  iconSize: [20, 20]
              });
              DG.marker([stlat[i], stlon[i]], {
                  icon: myIcon
              }).addTo(map);
              myDivIcon = DG.divIcon({
                  iconSize: [70, 20],
                  html: '<b style="color:blue;">HTML-код</b>'
              });
              DG.marker([54.98, 82.87], {
                  icon: myDivIcon
              }).addTo(map);
            }
          });
       }
    }
    req.open('GET','/ost_show');
    req.send();
};

function bus_show() {
   var req = new XMLHttpRequest();
   req.onreadystatechange= function(){
       if(req.readyState == 4){
          console.log(JSON.parse(req.responseText));
          var obj = JSON.parse(req.responseText);
          for(var i=0; i<obj.anims.length;i++){
            lat[i]=obj.anims[i].lat/1000000-37.530776;
            lon[i]=obj.anims[i].lon/1000000-16.099487;
            rtype[i]=obj.anims[i].rtype;
            name[i]=obj.anims[i].rnum;
          }
          DG.then(function() {
             for(var i=0; i<lat.length;i++){
               if(  rtype[i]=='А'){
                 myIcon = DG.icon({
                     iconUrl: 'images/bus.png',
                     iconSize: [30, 30]
                 });
              DG.marker([lat[i], lon[i]], {
                  icon: myIcon
              }).addTo(map)
              .bindLabel(obj.anims[i].rnum,{
                static: true
              });
              DG.marker([lat[i], lon[i]], {
                  icon: myIcon
              }).addTo(map)
              .bindLabel(obj.anims[i].rnum,{
                static: true
              });
              myDivIcon = DG.divIcon({
                  iconSize: [52, 17],
                  html: '<b style="color:blue;">HTML-код</b>'
              });
              DG.marker([0, 0], {
                  icon: myDivIcon
              }).addTo(map);
            }}
          });
        }
      }
      req.open('GET','/proxy');
      req.send();
    };
    function tram_show() {
       var req = new XMLHttpRequest();
       req.onreadystatechange= function(){
           if(req.readyState == 4){
              console.log(JSON.parse(req.responseText));
              var obj = JSON.parse(req.responseText);
              for(var i=0; i<obj.anims.length;i++){
                lat[i]=obj.anims[i].lat/1000000-37.530776;
                lon[i]=obj.anims[i].lon/1000000-16.099487;
                rtype[i]=obj.anims[i].rtype;
                name[i]=obj.anims[i].rnum;
              }
              DG.then(function() {
                 for(var i=0; i<lat.length;i++){
                   if(  rtype[i]=='Тр'){
                     myIcon = DG.icon({
                         iconUrl: 'images/tram.png',
                         iconSize: [30, 30]
                     });
                  DG.marker([lat[i], lon[i]], {
                      icon: myIcon
                  }).addTo(map)
                  .bindLabel(obj.anims[i].rnum,{
                    static: true
                  });
                  myDivIcon = DG.divIcon({
                      iconSize: [52, 17],
                      html: '<b style="color:blue;">HTML-код</b>'
                  });
                  DG.marker([0, 0], {
                      icon: myDivIcon
                  }).addTo(map);
                }}
              });
            }
          }
          req.open('GET','/proxy');
          req.send();
        };
        function troll_show() {
           var req = new XMLHttpRequest();
           req.onreadystatechange= function(){
               if(req.readyState == 4){
                  console.log(JSON.parse(req.responseText));
                  var obj = JSON.parse(req.responseText);
                  for(var i=0; i<obj.anims.length;i++){
                    lat[i]=obj.anims[i].lat/1000000-37.530776;
                    lon[i]=obj.anims[i].lon/1000000-16.099487;
                    rtype[i]=obj.anims[i].rtype;
                    name[i]=obj.anims[i].rnum;
                  }
                  DG.then(function() {
                     for(var i=0; i<lat.length;i++){
                       if(  rtype[i]=='Т'){
                         myIcon = DG.icon({
                             iconUrl: 'images/troll.png',
                             iconSize: [30, 30]
                         });
                      DG.marker([lat[i], lon[i]], {
                          icon: myIcon
                      }).addTo(map)
                      .bindLabel(obj.anims[i].rnum,{
                        static: true
                      });
                      myDivIcon = DG.divIcon({
                          iconSize: [52, 17],
                          html: '<b style="color:blue;">HTML-код</b>'
                      });
                      DG.marker([0, 0], {
                          icon: myDivIcon
                      }).addTo(map);
                    }}
                  });
                }
              }
              req.open('GET','/proxy');
              req.send();
            };
