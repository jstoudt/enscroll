/**
enscroll.js - jQuery plugin to add custom scrollbars HTML block elements
Copyright (C) 2012  Jason T. Stoudt

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
***/

(function($, win, doc) {

	var eventUtility = { // event helper functions
			
		getEvent: function(event) {
			return event || win.event;
		},

		preventDefault: function(event) {
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
		}

	},

	reqAnimFrame = win.requestAnimationFrame ||
			win.mozRequestAnimationFrame ||
			win.webkitRequestAnimationFrame ||
			win.oRequestAnimationFrame ||
			win.msRequestAnimationFrame,

	registerHoverEvents = function(pane) {
		var data = $(pane).data('enscroll'),
			settings = data.settings;
		if (settings.showOnHover) {
			$(pane).on({
				'mouseover.enscroll.pane': showScrollbars,
				'mouseout.enscroll.pane': hideScrollbars
			});

			if (settings.verticalScrolling) {
				$(data.verticalTrackWrapper).on({
					'mouseover.enscroll.vertical': function(event) {
						showScrollbars.call(pane, event);
					},
					'mouseout.enscroll.vertical': function(event) {
						hideScrollbars.call(pane, event);
					}
				});
			}

			if (settings.horizontalScrolling) {
				$(data.horizontalTrackWrapper).on({
					'mouseover.enscroll.horizontal': function(event) {
						showScrollbars.call(pane, event);
					},
					'mouseout.enscroll.horizontal': function(event) {
						hideScrollbars.call(pane, event);
					}
				});
			}
//			hideScrollbars.call(pane);
		}
	},

	unregisterHoverEvents = function(pane) {
		var data = $(pane).data('enscroll'),
			settings = data.settings;

		if (settings.showOnHover) {
			$(pane)
				.off('mouseover.enscroll.pane')
				.off('mouseout.enscroll.pane');

			if (settings.verticalScrolling) {
				$(data.verticalTrackWrapper)
					.off('mouseover.enscroll.vertical')
					.off('mouseout.enscroll.vertical');
			}

			if (settings.horizontalScrolling) {
				$(data.horizontalTrackWrapper)
					.off('mouseover.enscroll.horizontal')
					.off('mouseout.enscroll.horizontal');
			}
		}
	},

	startVerticalDrag = function(event) {
		// only handle events for left mouse button dragging
		if (event.which !== 1) { return; }
		
		var pane = event.data.pane,
			data = $(pane).data('enscroll'),
			dragging = true,
			track, handle, handleY, oldHandleY, paneScrollHeight,
			mouseYOffset, handleHeight, trackHeight, trackYOffset, bodyCursor,

			moveHandle = function() {
				if (dragging) {
					if (handleY !== oldHandleY) {
						handle.style.top = handleY + 'px';
						$(pane).scrollTop((handleY / (trackHeight - handleHeight)) *
							(paneScrollHeight - trackHeight));
						oldHandleY = handleY;
					}

					if (reqAnimFrame) {
						reqAnimFrame(moveHandle);
					} else {
						setTimeout(moveHandle, 1000 / 60);
					}
				}
			},

			moveDrag = function(event) {
				if (dragging) {
					handleY = event.clientY - trackYOffset - mouseYOffset;
					handleY = Math.max(0, Math.min(handleY, trackHeight - handleHeight));
				}
				return false;
			},

			endDrag = function(event) {
				dragging = false;
				
				doc.body.style.cursor = bodyCursor;
				this.style.cursor = 'pointer';
				
				$(doc.body)
					.off('mousemove.enscroll.vertical')
					.off('mouseup.enscroll.vertical');

				registerHoverEvents(pane);
				
				return false;
			};
		
		track = data.verticalTrackWrapper.firstChild;
		handle = track.firstChild
		handleY = parseInt(handle.style.top, 10);
		paneScrollHeight = pane.scrollHeight;
		mouseYOffset = event.clientY - $(handle).offset().top;
		handleHeight = $(handle).height();
		trackHeight = $(track).height();
		trackYOffset = $(track).offset().top;
		
		$(doc.body).on({
			'mousemove.enscroll.vertical': moveDrag,
			'mouseup.enscroll.vertical': function(event) {
				endDrag.call(handle, event);
			}
		});

		bodyCursor = $('body').css('cursor');
		this.style.cursor = doc.body.style.cursor = 'ns-resize';

		unregisterHoverEvents(pane);

		moveHandle();

		return false;
	},

	startHorizontalDrag = function(event) {
		if (event.which !== 1) { return; }

		var pane = event.data.pane,
			data = $(pane).data('enscroll'),
			dragging = true,
			track, handle, handleX, oldHandleX, paneScrollWidth,
			mouseXOffset, handleWidth, trackWidth, trackXOffset, bodyCursor,

			moveHandle = function() {
				if (dragging) {
					if (handleX !== oldHandleX) {
						handle.style.left = handleX + 'px';
						$(pane).scrollLeft((handleX / (trackWidth - handleWidth)) *
							(paneScrollWidth - trackWidth));
						oldHandleX = handleX;
					}

					if (reqAnimFrame) {
						reqAnimFrame(moveHandle);
					} else {
						setTimeout(moveHandle, 1000 / 60);
					}
				}
			},

			moveDrag = function(event) {
				if (dragging) {
					handleX = event.clientX - trackXOffset - mouseXOffset;
					handleX = Math.max(0, Math.min(handleX, trackWidth - handleWidth));
				}
				return false;
			},

			endDrag = function(event) {
				dragging = false;
				
				doc.body.style.cursor = bodyCursor;
				this.style.cursor = 'pointer';
				
				$(doc.body)
					.off('mousemove.enscroll.horizontal')
					.off('mouseup.enscroll.horizontal');

				registerHoverEvents(pane);
				
				return false;
			};
			
		track = data.horizontalTrackWrapper.firstChild;
		handle = track.firstChild;
		handleX = parseInt(handle.style.left, 10);
		paneScrollWidth = pane.scrollWidth;
		mouseXOffset = event.clientX - $(handle).offset().left;
		handleWidth = $(handle).width();
		trackWidth = $(track).width();
		trackXOffset = $(track).offset().left;
		
		$(doc.body).on({
			'mousemove.enscroll.horizontal': moveDrag,
			'mouseup.enscroll.horizontal': function(event) {
				endDrag.call(handle, event);
			}
		});

		bodyCursor = $('body').css('cursor');
		this.style.cursor = doc.body.style.cursor = 'ew-resize';

		unregisterHoverEvents(pane);

		moveHandle();

		return false;

	},

	mouseScroll = function(event) {
		var data = this.data('enscroll'),
			scrollLeft0, scrollTop0, delta, scrollIncrement;

		if (data) {
			event = eventUtility.getEvent(event);
			delta = (event.detail) ? -event.detail :
				(typeof client !== 'undefined' && client.engine.opera && client.engine.opera < 9.5) ? -event.wheelDelta :
				event.wheelDelta;
			scrollIncrement = data.settings.scrollIncrement;

			if (event.wheelDelta && event.wheelDeltaX &&
					event.wheelDelta === event.wheelDeltaX ||
					event.axis && event.HORIZONTAL_AXIS &&
					event.axis === event.HORIZONTAL_AXIS) {
				scrollLeft0 = this.scrollLeft();
				this.scrollLeft(scrollLeft0 + (delta < 0 ? scrollIncrement : -scrollIncrement));

				if (scrollLeft0 !== this.scrollLeft()) {
					eventUtility.preventDefault(event);
				}
			} else {
				scrollTop0 = this.scrollTop();
				this.scrollTop(scrollTop0 + (delta < 0 ? scrollIncrement : -scrollIncrement));
				
				if (scrollTop0 !== this.scrollTop()) {
					eventUtility.preventDefault(event);
				}
			}
		}
	},

	paneScrolled = function(event) {
		var $this = $(this),
			data = $this.data('enscroll'),
			handle, track, pct;

		if (data) {
			if (data.settings.verticalScrolling) {
				track = data.verticalTrackWrapper.firstChild;
				handle = track.firstChild;
				pct = $this.scrollTop() / (this.scrollHeight - $this.innerHeight());
				pct = isNaN(pct) ? 0 : pct;
				handle.style.top = (pct * ($(track).height() - $(handle).height())) + 'px';
			}

			if (data.settings.horizontalScrolling) {
				track = data.horizontalTrackWrapper.firstChild;
				handle = track.firstChild;
				pct = $this.scrollLeft() / (this.scrollWidth - $this.innerWidth());
				pct = isNaN(pct) ? 0 : pct;

				handle.style.left = (pct * ($(track).width() - $(handle).width())) + 'px';
			}
		}

	},

	keyHandler = function(event) {
		var $this = $(this),
			data = $this.data('enscroll'),
			settings,
			scrollVertical = function(dy) {
				var y0 = $this.scrollTop();
				if (settings.verticalScrolling) {
					$this.scrollTop(y0 + dy);
				}
				// prevent default unless we didn't actually scroll anything
				return y0 === $this.scrollTop();
			},
			scrollHorizontal = function(dx) {
				var x0 = $this.scrollLeft();
				if (settings.horizontalScrolling) {
					$this.scrollLeft(x0 + dx);
				}
				return x0 === $this.scrollLeft();
			};
		
		// don't handle events that have just bubbled up
		if (event.target === this && data) {
			settings = data.settings;
			switch(event.keyCode) {
				case 32: // space
				case 34: // page down
					return scrollVertical($this.innerHeight());
				case 33: // page up
					return scrollVertical(-$this.innerHeight());
				case 35: // end
					return scrollVertical(this.scrollHeight);
				case 36: // home
					return scrollVertical(-this.scrollHeight);
				case 37: // left
					return scrollHorizontal(-data.settings.scrollIncrement);
				case 38: // up
					return scrollVertical(-data.settings.scrollIncrement);
				case 39: // right
					return scrollHorizontal(data.settings.scrollIncrement);
				case 40: // down
					return scrollVertical(data.settings.scrollIncrement);
			}
		}
	},

	touchStart = function(event) {
		var touchX, touchY,
			touchMove = function(event) {
				var $this = $(this),
					touchX0 = touchX,
					touchY0 = touchY,
					scrollLeft = $this.scrollLeft(),
					scrollTop = $this.scrollTop();

				event = eventUtility.getEvent(event);

				touchX = event.touches[0].clientX;
				touchY = event.touches[0].clientY;

				$this.scrollLeft(scrollLeft + (touchX0 - touchX))
					.scrollTop(scrollTop + (touchY0 - touchY));

				if (scrollTop !== $this.scrollTop() ||
					scrollLeft !== $this.scrollLeft()) {
					eventUtility.preventDefault(event);
				}
			},

			touchEnd = function(event) {
				this.removeEventListener('touchmove', touchMove, false);
				this.removeEventListener('touchend', touchEnd, false);
			};

		event = eventUtility.getEvent(event);
		if (event.touches.length === 1) {
			touchX = event.touches[0].clientX;
			touchY = event.touches[0].clientY;
			if (this.addEventListener) {
				this.addEventListener('touchmove', touchMove, false);
				this.addEventListener('touchend', touchEnd, false);
			}
		}
	},

	showScrollbars = function(event) {
		var data = $(this).data('enscroll'),
			settings = data.settings;

		if (data && settings.showOnHover) {
			if (settings.verticalScrolling &&
				$(data.verticalTrackWrapper).css('display') !== 'none') {
				$(data.verticalTrackWrapper).stop().fadeTo('normal', 1);
			}

			if (settings.horizontalScrolling &&
				$(data.horizontalTrackWrapper).css('display') !== 'none') {
				$(data.horizontalTrackWrapper).stop().fadeTo('normal', 1);
			}
		}
	},

	hideScrollbars = function(event) {
		var data = $(this).data('enscroll'),
			settings = data.settings;

		if (data && settings.showOnHover) {
			if (settings.verticalScrolling &&
				$(data.verticalTrackWrapper).css('display') !== 'none') {
				$(data.verticalTrackWrapper).stop().fadeTo('normal', 0);
			}

			if (settings.horizontalScrolling &&
				$(data.horizontalTrackWrapper).css('display') !== 'none') {
				$(data.horizontalTrackWrapper).stop().fadeTo('normal', 0);
			}
		}
	},

	api = {
		reposition: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('enscroll'),
					positionElem = function(elem, x, y) {
						elem.style.left = x + 'px';
						elem.style.top = y + 'px';
					},
					trackWrapper, offset;
				if (data) {
					offset = $this.offset();
					if (data.settings.verticalScrolling) {
						trackWrapper = data.verticalTrackWrapper;
						positionElem(trackWrapper,
							offset.left + $this.outerWidth() - $(trackWrapper).width() - parseInt($this.css('border-right-width'), 10),
							offset.top + parseInt($this.css('border-top-width'), 10));
					}

					if (data.settings.horizontalScrolling) {
						trackWrapper = data.horizontalTrackWrapper;
						positionElem(trackWrapper,
							offset.left + parseInt($this.css('border-left-width'), 10),
							offset.top + $this.outerHeight() - $(trackWrapper).height() - parseInt($this.css('border-bottom-width'), 10));
					}
				}
			});
		},

		resize: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('enscroll'),
					settings, paneHeight, paneWidth,
					trackWrapper, pct, track, trackWidth, trackHeight,
					handle, handleWidth, handleHeight;

				if (data) {
					settings = data.settings;
					if (settings.verticalScrolling) {
						trackWrapper = data.verticalTrackWrapper;
						paneHeight = $this.innerHeight();
						pct = paneHeight / this.scrollHeight;
						track = trackWrapper.firstChild;

						trackHeight = settings.horizontalScrolling ?
							paneHeight - $(data.horizontalTrackWrapper.firstChild).height() :
							paneHeight;

						handle = track.firstChild;
						handleHeight = Math.max(pct * trackHeight,
							settings.minScrollbarLength);

						// hide the track first -- this causes less reflows and
						// fixes an IE8 bug that prevents background images
						// from being redrawn
						trackWrapper.style.display = 'none';
						track.style.height = trackHeight + 'px';
						handle.style.height = handleHeight + 'px';
						if (pct < 1) {
							pct = $this.scrollTop() / (this.scrollHeight - $this.height());
							handle.style.top = (pct * (trackHeight - handleHeight)) + 'px';
							trackWrapper.style.display = 'block';
						}
					}

					if (settings.horizontalScrolling) {
						trackWrapper = data.horizontalTrackWrapper;
						paneWidth = $this.innerWidth();
						pct = paneWidth / this.scrollWidth;
						track = trackWrapper.firstChild;

						trackWidth = settings.verticalScrolling ?
							paneWidth - $(data.horizontalTrackWrapper.firstChild).height() :
							paneWidth;

						handle = track.firstChild;
						handleWidth = Math.max(pct * trackWidth,
							settings.minScrollbarLength);

						// see comment above
						trackWrapper.style.display = 'none';
						track.style.width = trackWidth + 'px';
						handle.style.width = handleWidth + 'px';
						if (pct < 1) {
							pct = $this.scrollLeft() / (this.scrollWidth - $this.width());
							handle.style.left = (pct * (trackWidth - handleWidth)) + 'px';
							trackWrapper.style.display = 'block';
						}
					}
				}

			});
		},

		startPolling: function() {
			return this.each(function() {
				var data = $(this).data('enscroll'),
					pane = this,
					$pane = $(pane),
					paneWidth = 0,
					paneHeight = 0,
					paneScrollWidth = 0,
					paneScrollHeight = 0,
					paneOffset,

					paneChangeListener = function() {
						if (data.settings.pollChanges) {
							var sw = pane.scrollWidth,
								sh = pane.scrollHeight,
								pw = $pane.width(),
								ph = $pane.height(),
								offset = $pane.offset();

							if (data.settings.verticalScrolling &&
									(ph !== paneHeight || sh !== paneScrollHeight) ||
								data.settings.horizontalScrolling &&
									(pw !== paneWidth || sw !== paneScrollWidth)) {
								paneScrollWidth = sw;
								paneScrollHeight = sh;
								
								api.resize.call($pane);
							}

							if (paneOffset.left !== offset.left ||
									paneOffset.top !== offset.top ||
									pw !== paneWidth ||
									ph !== paneHeight) {
								
								paneOffset = offset;
								paneWidth = pw;
								paneHeight = ph;

								api.reposition.call($pane);
							}

							setTimeout(paneChangeListener, 300);
						}
					};
				
				if (data) {
					data.settings.pollChanges = true;
					paneScrollHeight = pane.scrollHeight;
					paneScrollWidth = pane.scrollWidth;
					paneOffset = $pane.offset();
					paneChangeListener();
				}
			});
		},

		stopPolling: function() {
			return this.each(function() {
				var data = $(this).data('enscroll');
				if (data) {
					data.settings.pollChanges = false;
				}
			});
		},

		destroy: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('enscroll'),
					trackWrapper, trackWidth, trackHeight, mouseScrollHandler;
				if (data) {

					unregisterHoverEvents(this);

					api.stopPolling.call($this);

					mouseScrollHandler = data._mouseScrollHandler;

					if (data.settings.verticalScrolling) {
						trackWrapper = data.verticalTrackWrapper;
						trackWidth = $(trackWrapper.firstChild).outerWidth();
						
						$(trackWrapper).remove();
						trackWrapper = null;

						$this.css({
							'width': ($this.width() + trackWidth) + 'px',
							'padding-right': (parseInt($this.css('padding-right'), 10) - trackWidth) + 'px'
						});
					}

					if (data.settings.horizontalScrolling) {
						trackWrapper = data.horizontalTrackWrapper;
						trackHeight = $(trackWrapper.firstChild).outerHeight();

						$(trackWrapper).remove();
						trackWrapper = null;

						$this.css({
							'height': ($this.height() + trackHeight) + 'px',
							'padding-bottom': (parseInt($this.css('padding-bottom'), 10) - trackHeight) + 'px'
						});
					}

					if (!data._hadTabIndex) {
						$this.removeAttr('tabindex');
					}

					$this
						.off('scroll.enscroll.pane')
						.off('keydown.enscroll.pane')
						.data('enscroll', null)
						.css('overflow', 'auto');

					if (this.removeEventListener) {
						this.removeEventListener('mousewheel', mouseScrollHandler, false);
						this.removeEventListener('DOMMouseScroll', mouseScrollHandler, false);
						this.removeEventListener('touchstart', touchStart, false);
					} else if (this.detachEvent) {
						this.detachEvent('onmousewheel', mouseScrollHandler);
					} else {
						this.onmousewheel = null;
					}
					
					$(win).off('resize.enscroll.window');
				}
			});
		}
	};


	$.fn.enscroll = function(opts) {

		// handle API method calls
		if (api[opts]) {
			return api[opts].call(this);
		}
		// otherwise, initialize the enscroll element

		// use default settings, and overwrite defaults with options passed in
		var settings = $.extend({
			verticalScrolling: true,
			horizontalScrolling: false,
			showOnHover: false,
			scrollIncrement: 20,
			minScrollbarLength: 25,
			pollChanges: true,
			verticalTrackClass: 'vertical-track',
			horizontalTrackClass: 'horizontal-track',
			horizontalHandleClass: 'horizontal-handle',
			verticalHandleClass: 'vertical-handle',
			horizontalHandleHTML: '<div class="left"></div><div class="right"></div>',
			verticalHandleHTML: '<div class="top"></div><div class="bottom"></div>'
		}, opts);
		
		return this.each(function() {

			// 1. only apply this plugin to elements with overflow: auto
			// 2. don't apply this plugin when both scrolling settings are false
			if ($(this).css('overflow') !== 'auto' ||
				!settings.verticalScrolling && !settings.horizontalScrolling) {
				return;
			}

			var $this = $(this),
				pane = this,
				paneWidth = $this.innerWidth(),
				paneHeight = $this.innerHeight(),
				paneOffset = $this.offset(),
				hadTabIndex = true,
				paneScrollWidth = pane.scrollWidth,
				paneScrollHeight = pane.scrollHeight,
				horizontalTrackWrapper, verticalTrackWrapper,
				horizontalTrack, verticalTrack,
				horizontalHandle, verticalHandle,
				trackHeight, trackWidth,
				outline, tabindex,

				// closures to bind events to handlers
				mouseScrollHandler = function(event) {
					mouseScroll.call($this, event);
				},
				addHandleHTML = function(handle, html) {
					if (typeof html === 'string') {
						$(handle).html(html);
					} else if (typeof html === 'object' && html !== null &&
							html.nodeType && html.nodeType === 1) {
						handle.appendChild(html);
					}
				};

			// if we want vertical scrolling, create and initialize
			// the horizontal scrollbar and its components
			if (settings.verticalScrolling) {
				verticalTrackWrapper = doc.createElement('div');
				verticalTrack = doc.createElement('div');
				verticalHandle = doc.createElement('div');
				
				$(verticalTrack)
					.css('position', 'relative')
					.addClass(settings.verticalTrackClass)
					.appendTo(verticalTrackWrapper);

				$(verticalHandle)
					.css({
						'position': 'absolute',
						'cursor': 'pointer'
					})
					.addClass(settings.verticalHandleClass)
					.mousedown({ pane: this }, startVerticalDrag)
					.appendTo(verticalTrack);

				addHandleHTML(verticalHandle, settings.verticalHandleHTML);

				$(verticalTrackWrapper)
					.css({
						'position': 'absolute',
						'margin': 0,
						'padding': 0,
						'z-index': 1
					})
					.insertAfter(this);

				if (settings.showOnHover) {
					$(verticalTrackWrapper)
						.css('opacity', 0)
						.on({
							'mouseover.enscroll.vertical': function(event) {
								showScrollbars.call(pane, event);
							},
							'mouseout.enscroll.vertical': function(event) {
								hideScrollbars.call(pane, event);
							}
						});
				}

				trackWidth = $(verticalTrack).outerWidth();

				// move the content in the pane over to make room for
				// the vertical scrollbar
				$this.css({
					'width': ($this.width() - trackWidth) + 'px',
					'padding-right': (parseInt($this.css('padding-right'), 10) + trackWidth) + 'px'
				});

			}

			// if we want horizontal scrolling, create the elements for and
			// initialize the horizontal track and handle
			if (settings.horizontalScrolling) {
				horizontalTrackWrapper = doc.createElement('div');
				horizontalTrack = doc.createElement('div');
				horizontalHandle = doc.createElement('div');

				$(horizontalTrack)
					.css('position', 'relative')
					.addClass(settings.horizontalTrackClass)
					.appendTo(horizontalTrackWrapper);

				$(horizontalHandle)
					.css({
						'position': 'absolute',
						'cursor': 'pointer'
					})
					.addClass(settings.horizontalHandleClass)
					.mousedown({ pane: this }, startHorizontalDrag)
					.appendTo(horizontalTrack);

				addHandleHTML(horizontalHandle, settings.horizontalHandleHTML);

				$(horizontalTrackWrapper)
					.css({
						'position': 'absolute',
						'margin': 0,
						'padding': 0,
						'z-index': 1
					})
					.insertAfter(this);
				
				if (settings.showOnHover) {
					$(horizontalTrackWrapper)
						.css('opacity', 0)
						.on({
							'mouseover.enscroll.horizontal': function(event) {
								showScrollbars.call(pane, event);
							},
							'mouseout.enscroll.horizontal': function(event) {
								hideScrollbars.call(pane, event);
							}
						});
				}

				trackHeight = $(horizontalTrack).outerHeight();

				$this.css({
					'height': ($this.height() - trackHeight) + 'px',
					'padding-bottom': (parseInt($this.css('padding-bottom'), 10) + trackHeight) + 'px'
				});

			}

			// add a tabindex attribute to the pane if it doesn't already have one
			// if the element does not have a tabindex in IE6, undefined is returned,
			// all other browsers return an empty string
			tabindex = $this.attr('tabindex');
			if (!tabindex || tabindex.length < 1) {
				$this.attr('tabindex', 0);
				hadTabIndex = false;
			}

			// if the outline style is not specified in IE6, null is returned
			// all other browsers return an empty string
			outline = $this.css('outline');
			if (!outline || outline.length < 1) {
				$this.css('outline', 'none');
			}

			// register an handler that listens for the pane to scroll, and
			// sync the scrollbars' positions
			$this
				.on({
					'scroll.enscroll.pane': function(event) {
						paneScrolled.call(this, event);
					},
					'keydown.enscroll.pane': keyHandler
				})
				.css('overflow', 'hidden')
				// store the data we need for handling events and destruction
				.data('enscroll', {
					settings: settings,
					horizontalTrackWrapper: horizontalTrackWrapper,
					verticalTrackWrapper: verticalTrackWrapper,
					_mouseScrollHandler: mouseScrollHandler,
					_hadTabIndex: hadTabIndex
				});

			// reposition the scrollbars if the window is resized
			$(win).on('resize.enscroll.window', function(event) {
				api.reposition.call($this);
			});

			// if showOnHover is set, attach the hover listeners
			if (settings.showOnHover) {
				registerHoverEvents(this);
			}

			// listen for mouse wheel and touch events and scroll appropriately
			if (this.addEventListener) {
				this.addEventListener('mousewheel', mouseScrollHandler, false);
				this.addEventListener('DOMMouseScroll', mouseScrollHandler, false);
				this.addEventListener('touchstart', touchStart, false);
			} else if (this.attachEvent) {
				// oldie love
				this.attachEvent('onmousewheel', mouseScrollHandler);
			} else {
				// a "just in case" fallback
				this.onmousewheel = mouseScrollHandler;
			}

			// start polling for changes in dimension and position
			if (settings.pollChanges) {
				api.startPolling.call($this);
			} else {
				api.resize.call($this);
				api.reposition.call($this);
			}

			// fix bug in IE7 where handle is not correctly sized
			$(verticalTrack, horizontalTrack)
				.removeClass(settings.verticalTrackClass)
				.addClass(settings.verticalTrackClass);
			
		});

	};

})(jQuery, window, document);
