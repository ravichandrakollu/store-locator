var locator = (function(){

	function View(el, options) {
		this.init(el, options);
	}

	View.prototype.init = function(el, options) {
		this.$el = $(el);
		this.options = $.extend({}, this.options(), options);
		this.locations = [];
		this.$dataPosition = this.$el.find('div[data-position]');

		//init Location and Map only if data-position exists
		if(this.$dataPosition.length>0){
			this.$el.prepend('<div class="map-container"></div>');
			for(var i=0; i<this.$dataPosition.length; i++) {
				//adds id attribute to div[data-position]
				$(this.$dataPosition[i]).attr('data-id', i);
				//new Location object
				var locationObj = new Location(this.$dataPosition[i]);
				this.locations.push(locationObj.location);
			}
			new Map(this);
		}

	};

	View.prototype.options = function() { 
        return {
			mapOptions: {
	            clickableIcons: false
			},
            markerIcon: {},
			clusterOptions: {
				imagePath: 'https://raw.githubusercontent.com/googlemaps/v3-utility-library/master/markerclustererplus/images/m'
			},
			mapContainer: {
				height: '450px'
			},
			markerClickCallback: function(marker, map) {
				var $target = $('div[data-id="'+marker.id+'"]');
				var topPos = $target.offset().top;
				$('.locator').find('div').removeClass("active");

				$('html, body').animate({
				  scrollTop: topPos
				}, 500);

				$target.addClass("active");
			}
		}
	};

	function Location(el) {
		this.init(el);
	}

	Location.prototype.init = function(el) {
		this.location = $(el).attr('data-position')
							 .split(',')
							 .map(function(item) {
								return item.trim();
							 });
		this.content = $(el).html();
		this.lat = this.location[0];
		this.lng = this.location[1];

		return this.location;
	};

	function Map(view) {
		this.init(view);
	}

	Map.prototype.init = function(view) {
		this.view = view;
		this.locations = this.view.locations;
		this.bounds = new google.maps.LatLngBounds();
		this.markerObj = [];
		this.mapContainer = $('.map-container').css(this.view.options.mapContainer);
		this.map = new google.maps.Map(this.mapContainer[0], this.view.options.mapOptions);
		$(this.locations).each(this.createMarker.bind(this));
		this.markerCluster = new MarkerClusterer(this.map, this.markerObj, this.view.options.clusterOptions);

		//'self' to use 'this' in case of click event
		var self = this;
		$(this.markerObj).each(function(index, marker) {
			marker.addListener('click', self.onMarkerClick.bind(self));
		});
		$(window).on('resize',  _.debounce(this.setMapBound.bind(this), 250));
	};

	Map.prototype.createMarker = function(index) {
		var location = this.view.locations[index];
		var lat = location[0];
		var lng = location[1];
		var myLatlng = new google.maps.LatLng(lat,lng);
		console.log();
		var marker = new google.maps.Marker({
			map: this.map,
			position: myLatlng,
			icon: ($.isEmptyObject(this.view.options.markerIcon) === true)? '' : this.view.options.markerIcon ,
			id: index
		});

		this.bounds.extend(myLatlng);
		this.markerObj.push(marker);
		this.setCloseLocations();
		this.setMapBound();
	};

	Map.prototype.setCloseLocations = function() {
        //Always checks the first location and create map with little zoom out(by adding value to lat and lng)  
        if (this.bounds.getNorthEast().equals(this.bounds.getSouthWest())) {
            var firstLocation = new google.maps.LatLng(this.bounds.getNorthEast().lat() + 0.0003, this.bounds.getNorthEast().lng() + 0.0003);
            this.bounds.extend(firstLocation);
        }
	};

	Map.prototype.setMapBound = function() {
		this.map.fitBounds(this.bounds);
	};

	Map.prototype.onMarkerClick = function(e) {
		//stores the current marker in array
		var marker = this.markerObj.filter(function(marker){
			return (e.latLng === marker.position); 
		});
		this.view.options.markerClickCallback(marker[0], this);
	};

	//Init
	return function(key, options) {
        //only return if the device is not touchable 
        if(!("ontouchstart" in window || navigator.maxTouchPoints)) {
			$.when(
				$.getScript('https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js'),
				$.getScript('https://maps.googleapis.com/maps/api/js?key=' + key)
			).done(function(){
				$('.locator').each(function() {
					new View(this, options);
				});
			});
		}
	};

}());