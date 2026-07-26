/* menu modal */
var openmenu = document.querySelector('[data-action="open-menu"]');
var closemenu = document.querySelector('[data-action="close-menu"]');
var menu = document.querySelector('overlay');
openmenu.addEventListener('click', function(event) { 
	document.body.classList.toggle('open-menu');	
});
closemenu.addEventListener('click', function(event) { 
	document.body.classList.remove('open-menu');	
});
var menuinmenu = document.querySelector('overlay ul');
menuinmenu.addEventListener('click', function(event) { 
	document.body.classList.remove('open-menu');	
});

/* same-page links pointing to inner sections of the page */
var internal_links = document.querySelectorAll('a[href^="#"]');

for (let i = 0; i < internal_links.length; i++) {
	
	internal_links[i].addEventListener("click", function(event) {
		/* what link was clicked? */
		var pointingTo = internal_links[i].getAttribute('href');
		if (!pointingTo || pointingTo.charAt(0) !== '#') {
			return;
		}

		var targetSection = document.querySelector(pointingTo);
		if (!targetSection) {
			return;
		}

		event.preventDefault();
		
		/* what are the coordinates of that section? */ 
		var sectionPos = targetSection.getBoundingClientRect();
		sectionPosX = sectionPos.x + window.scrollX;
		sectionPosY = sectionPos.y + window.scrollY;
		if ( window.innerWidth > 1024 ) {
			sectionPosY = 0;
		}
		
		/* scroll there */
		var scrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
		window.scroll({ left: sectionPosX, top: sectionPosY, behavior: scrollBehavior });
	});
}

/*
scrollConverter 1.0.2
https://github.com/koggdal/scroll-converter
Copyright 2011–2017 Johannes Koggdal (http://koggdal.com/)
Developed for BombayWorks (http://bombayworks.com/)
Released under MIT license
*/


window.scrollConverter = (function (window, document, undefined) {

	// Private vars
	var docElem = document.documentElement,
		active = false,
		hasDeactivated = false,
		eventsBound = false;

	var mouseWheelHandler;
	var scrollHandler;

	// Private methods
	var scrollCallback = function (offset, event, callback) {

			// Abort the scrolling if it's inactive
			if (!active) {
				return true;
			}

			var delta, newOffset,
				docOffset, scrollWidth, winWidth, maxOffset;

			// Find the maximum offset for the scroll
			docOffset = (docElem ? docElem.offsetWidth : 0) || 0;
			scrollWidth = document.body.scrollWidth || 0;
			winWidth = docElem ? docElem.clientWidth : 0;
			maxOffset = Math.max(docOffset, scrollWidth) - winWidth;

			// Let deliberate horizontal trackpad gestures use native scrolling.
			if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
				return true;
			}

			// Preserve pixel-for-pixel trackpad movement. Convert line/page wheel
			// units only when the browser does not report pixels.
			delta = event.deltaY;
			if (event.deltaMode === 1) {
				delta *= 16;
			} else if (event.deltaMode === 2) {
				delta *= window.innerWidth;
			}

			newOffset = offset.x + delta;

			// Do the scroll if the new offset is positive
			if (newOffset >= 0 && newOffset <= maxOffset) {
				offset.x = newOffset;
				offset.setByScript = true;
				window.scrollTo({ left: offset.x, top: offset.y, behavior: 'auto' });
			}
			// Keep the offset within the boundaries
			else if (offset.x !== 0 && offset.x !== maxOffset) {
				offset.x = newOffset > maxOffset ? maxOffset : 0;
				offset.setByScript = true;
				window.scrollTo({ left: offset.x, top: offset.y, behavior: 'auto' });
			}

			// Fire the callback
			if (typeof callback === "function") {
				callback(offset);
			}

			return false;
		},

		getOffset = function (axis) {
			axis = axis.toUpperCase();
			var pageOffset = "page" + axis + "Offset",
				scrollValue = "scroll" + axis,
				scrollDir = "scroll" + (axis === "X" ? "Left" : "Top");

			// Get the scroll offset for all browsers
			return window[pageOffset] || window[scrollValue] || (function () {
				var rootElem = document.documentElement || document.body.parentNode;
				return ((typeof rootElem[scrollDir] === "number") ? rootElem : document.body)[scrollDir];
			}());
		},

		bindEvents = function (offset, cb) {

			var callback = function (e) {

					// Fix event object for IE8 and below
					e = e || window.event;

					// Trigger the scroll behavior
					var shouldPreventDefault = scrollCallback(offset, e, cb) === false;

					// Prevent the normal scroll action to happen
					if (shouldPreventDefault) {
						if (e.preventDefault && e.stopPropagation) {
							e.preventDefault();
							e.stopPropagation();
						} else {
							return false;
						}
					}
				},

				updateOffsetOnScroll = function () {

					// Update the offset variable when the normal scrollbar is used
					if (!offset.setByScript) {
						offset.x = getOffset("x");
						offset.y = getOffset("y");
					}
					offset.setByScript = false;
				};

			mouseWheelHandler = callback;
			scrollHandler = updateOffsetOnScroll;

			// Modern browsers
			if (window.addEventListener) {
				window.addEventListener("wheel", mouseWheelHandler, { passive: false });
				window.addEventListener("scroll", scrollHandler, false);
			}
			// IE8 and below
			else {
				document.attachEvent("onmousewheel", mouseWheelHandler);
				window.attachEvent("onscroll", scrollHandler);
			}
		},

		unbindEvents = function () {
			if (!mouseWheelHandler && !scrollHandler) return;

			// Modern browsers
			if (window.removeEventListener) {
				window.removeEventListener("wheel", mouseWheelHandler, { passive: false });
				window.removeEventListener("scroll", scrollHandler, false);
			}
			// IE8 and below
			else {
				document.detachEvent("onmousewheel", mouseWheelHandler);
				window.detachEvent("onscroll", scrollHandler);
			}
		},

		deactivateScrolling = function (e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		};

	// Return a public API
	return {

		// Activate the scrolling switch
		//  An optional callback can be passed in, which will fire at every scroll update
		activate: function (callback) {

			// Set state
			active = true;

			// Bind events if it hasn't been done before
			if (!eventsBound) {
				var offset = { x: 0, y: 0 };
				bindEvents(offset, callback);
				eventsBound = true;
			}

			// Remove event handlers if it was previously deactivated
			if (hasDeactivated) {
				if (window.addEventListener) {
					window.removeEventListener("scroll", deactivateScrolling, true);
				} else {
					window.detachEvent("onscroll", deactivateScrolling);
				}
				hasDeactivated = false;
			}
		},

		deactivate: function () {
			active = false;

			if (eventsBound) {
				unbindEvents();
				eventsBound = false;
			}
		},

		deactivateAllScrolling: function () {

			// Set state
			active = false;
			hasDeactivated = true;

			// Bind event handlers to disable the scroll
			if (window.addEventListener) {
				window.addEventListener("scroll", deactivateScrolling, true);
			} else {
				window.attachEvent("onscroll", deactivateScrolling);
			}
		}
	};
}(window, document));

makehorizontal();

function makehorizontal() {
	if ( window.innerWidth > 1024) {
		document.body.classList.add('horizontal');
		scrollConverter.activate();
	}
	else {
		document.body.classList.remove('horizontal');
		scrollConverter.deactivate();
	}
}

window.addEventListener("resize", function(){
	makehorizontal();
});
