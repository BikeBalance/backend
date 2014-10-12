$(document).ready(function() {

    if($('#map-canvas').length){
      var generateMap = function(data){
        var heatMapData = []

        $.each(data, function(i,v){
            heatMapData.push({location: new google.maps.LatLng(v.lat,v.long), weight: (v.nbBikes/v.nbDocks) });
        });

        var london = new google.maps.LatLng(51.504927,-0.109505);

        map = new google.maps.Map(document.getElementById('map-canvas'), {
          center: london,
          zoom: 12,
          //mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var heatmap = new google.maps.visualization.HeatmapLayer({
          data: heatMapData
        });
          var gradient = [
            'rgba(0, 255, 255, 0)',
           
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
          ]
          heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
        heatmap.setMap(map);
        }
        $.get('http://borisbike.me/stations', function(data){
            generateMap(JSON.parse(data));

        });
    }

    if($('#list-top').length){
      $.get('http://borisbike.me/stations/top', function (d){
          var data = JSON.parse(data);

          var $list = $('<ul></ul>');

          for(var i = 0; i < 10; i ++){
            $list.append($('<li></li>').text(data[i].name));
          }

          $('#list-top').html(list);

      });
    }


});
