DG.then(function() {
                var map,
                    marker;

                    map = DG.map('map', {
                        center: [52.284404, 104.295782],
                        zoom: 13
                    });



                marker = DG.marker([52.284404, 104.295782]).addTo(map);

                var increment = 0.0001;
                var nlat=52.289404;
                var nlon=104.200782;
                function move() {
                    if (marker.getLatLng().lat<nlat||marker.getLatLng().lng<nlon) {
                      var newLat = marker.getLatLng().lat + increment,
                          newLng = marker.getLatLng().lng + increment;
                      marker.setLatLng([newLat, newLng]);
                    }
                }

                setInterval(move, 100);
            });
