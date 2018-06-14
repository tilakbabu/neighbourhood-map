var college_data = {};
$(function() {
    $.ajax({
        type: 'GET',
        // Engineering colleges data - API
        url: 'http://engineering.apssdc.in/sdc/college/getCollegeData',
        success: function(data) {
            //getting data in string format
            sessionStorage['college_data'] = JSON.stringify(data);
        }
    });
});
// accessing session storage data
var objstring = sessionStorage['college_data'];
//converting string to javascript object
var centers = JSON.parse(objstring);
//variable to make JSON object
var centersList2 = '';
var newstring = [];
var len = Object.keys(centers.responseObject).length;
//loop through parsed json data
for (var i = 0; i < len; i++) {

    //college name
    name1 = centers.responseObject[i].name;
    //latitude
    lat = centers.responseObject[i].lattitude;
    //longitude
    lng = centers.responseObject[i].longitude;
    //website
    website = centers.responseObject[i].website;

    centersList2 += '{"name": "' + name1 + '","location": {"lat": "' + lat + '", "lng": "' + lng + '"},"website": "' + website + '"},'
}

centersList2 += '{"name": "' + centers.responseObject[0].name + '","location": {"lat": 0.0000, "lng": 0.0000},"website": "' + centers.responseObject[0].website + '"}'

var mystring = '[' + centersList2 + ']';

var newstring = JSON.parse(mystring);
for (var key in newstring) {
    if (newstring.hasOwnProperty(key)) {
        // convert string value to float - latitude and longitude
        var nlat = parseFloat(newstring[key].location['lat']);
        var nlng = parseFloat(newstring[key].location['lng']);

        //assign converted latitude and longitude

        newstring[key].location['lat'] = nlat;
        newstring[key].location['lng'] = nlng;
    }
}

// Create global variables to use in google maps
var map, infowindow, bounds;

//googleSuccess() is called when page is loaded
function googleSuccess() {
    "use strict";

    //Google map elements - set custom map marker
    var image = {
        "url": "img/32x32.png",
        // This marker is 32 pixels wide by 32 pixels high.
        "size": new google.maps.Size(32, 32),
        // The origin for this image is (0, 0).
        "origin": new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        "anchor": new google.maps.Point(0, 32)
    };

    //Google map elements - set map options
    // we can get customized styles from https://mapstyle.withgoogle.com/ import JSON
    var mapOptions = {
        "center": {
            "lat": 15.9129,
            "lng": 79.7400
        },
        zoom: 8,
        styles: [{
            "featureType": "landscape",
            "stylers": [{
                    "hue": "#FFBB00"
                },
                {
                    "saturation": 43.400000000000006
                },
                {
                    "lightness": 37.599999999999994
                },
                {
                    "gamma": 1
                }
            ]
        }, {
            "featureType": "road.highway",
            "stylers": [{
                    "hue": "#FFC200"
                },
                {
                    "saturation": -61.8
                },
                {
                    "lightness": 45.599999999999994
                },
                {
                    "gamma": 1
                }
            ]
        }, {
            "featureType": "road.arterial",
            "stylers": [{
                    "hue": "#FF0300"
                },
                {
                    "saturation": -100
                },
                {
                    "lightness": 51.19999999999999
                },
                {
                    "gamma": 1
                }
            ]
        }, {
            "featureType": "road.local",
            "stylers": [{
                    "hue": "#FF0300"
                },
                {
                    "saturation": -100
                },
                {
                    "lightness": 52
                },
                {
                    "gamma": 1
                }
            ]
        }, {
            "featureType": "water",
            "stylers": [{
                    "hue": "#0078FF"
                },
                {
                    "saturation": -13.200000000000003
                },
                {
                    "lightness": 2.4000000000000057
                },
                {
                    "gamma": 1
                }
            ]
        }, {
            "featureType": "poi",
            "stylers": [{
                "visibility": "off"
            }]
        }],
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    infowindow = new google.maps.InfoWindow({
        maxWidth: 150,
        content: ""
    });
    bounds = new google.maps.LatLngBounds();

    // Close infowindow when clicked elsewhere on the map
    map.addListener("click", function() {
        infowindow.close(infowindow);
    });

    // Recenter map upon window resize
    window.onresize = function() {
        map.fitBounds(bounds);
    };


    //Creating Space object
    var Space = function(data, id, map) {
        var self = this;

        this.name = ko.observable(data.name);
        this.college = data.name;
        this.location = data.location;
        this.marker = "";
        this.markerId = id;
        this.website = data.website;
        this.lat = data.location['lat'];
        this.lng = data.location['lng']
        //console.log(data.location['lat']);
    }

    // Get content infowindows
    function getContent(space) {

        var maininfo =
            "<div style='background-color:yellow;padding: 5px;'><h2><u>" + space.college + "</u></h2></div><br><div style='min-height:120px;background-color: lightgreen;padding: 5px;' data-toggle='popover'><h4><strong>Website: </strong><a href=" + space.website + " target='_BLANK' style='color:blue;'>" + space.website + "</a><br><br><strong>Latitude: </strong>" + space.lat + "<br><br><strong>Longitude: </strong>" + space.lng + "</h4></div>";

        var info = "<div style='background-color:yellow;'><h2><u>" + space.college + "</u></h2></div><br><div style='min-height:120px;background-color: lightgreen;padding: 5px;' data-toggle='popover'><h4><strong>Website: </strong>NA<br><br><strong>Latitude: </strong>" + space.lat + "<br><br><strong>Longitude: </strong>" + space.lng + "</h4></div>";

        if (space.website != 'undefined') {
            return maininfo;
        } else {
            return info;
        }
    }

    // Bounce effect on marker
    function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 700);
        }
    };

    function ViewModel() {
        var self = this;

        // Nav button control
        this.isNavClosed = ko.observable(false);
        this.navClick = function() {
            this.isNavClosed(!this.isNavClosed());
        };

        // Creating list elements from the spaceList
        this.spaceList = ko.observableArray();

        newstring.forEach(function(item) {
            self.spaceList.push(new Space(item));
        });
        // Create a marker per space item
        this.spaceList().forEach(function(space) {
            var marker = new google.maps.Marker({
                map: map,
                position: space.location,
                name: space.name,
                icon: image,
                animation: google.maps.Animation.DROP,
                website: space.website
            });

            space.marker = marker;
            // Extend the boundaries of the map for each marker
            bounds.extend(marker.position);
            // Create an onclick event to open an infowindow and bounce the marker at each marker
            marker.addListener("click", function(e) {
                map.panTo(this.position);
                //pan down infowindow by 200px to keep whole infowindow on screen
                map.panBy(0, -200)
                infowindow.setContent(getContent(space));
                infowindow.open(map, marker);
                toggleBounce(marker);
            });
        });

        // Creating click for the list item
        this.itemClick = function(space) {
            var markerId = space.markerId;
            google.maps.event.trigger(space.marker, "click");
        }

        // Filtering the Space list
        self.filter = ko.observable("");
        //console.log(self.filter);
        this.filteredSpaceList = ko.dependentObservable(function() {
            //search keyword storing
            var q = this.filter().toLowerCase();

            if (!q) {
                // Return self.spaceList() the original array;
                return ko.utils.arrayFilter(self.spaceList(), function(item) {
                    item.marker.setVisible(true);
                    return true;
                });
            } else {
                return ko.utils.arrayFilter(this.spaceList(), function(item) {
                    //console.log(item.college.toLowerCase().indexOf(q) >= 0);
                    if (item.college.toLowerCase().indexOf(q) >= 0) {
                        return true;
                    } else {
                        item.marker.setVisible(false);
                        return false;
                    }
                });
            }
        }, this);
    };

    // Activates knockout.js
    ko.applyBindings(new ViewModel());
}
