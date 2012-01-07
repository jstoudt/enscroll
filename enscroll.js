/*
 * enscroll.js
 */

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
		if (data && settings.showOnHover) {

			$(pane)
				.mouseover(showScrollbars)
				.mouseout(hideScrollbars);

			if (settings.verticalScrolling) {
				$(data.verticalTrackWrapper)
					.mouseover(function(event) {
						showScrollbars.call(pane, event);
					})
					.mouseout(function(event) {
						hideScrollbars.call(pane, event);
					});
			}

			if (settings.horizontalScrolling) {
				$(data.horizontalTrackWrapper)
					.mouseover(function(event) {
						showScrollbars.call(pane, event);
					})
					.mouseout(function(event) {
						hideScrollbars.call(pane, event);
					});
			}
			hideScrollbars.call(pane);
		}
	},

	unregisterHoverEvents = function(pane) {
		var data = $(pane).data('enscroll'),
			settings = data.settings;

		if (data && settings.showOnHover) {
			$(pane)
				.unbind('mouseover', showScrollbars)
				.unbind('mouseout', hideScrollbars);

			if (settings.verticalScrolling) {
				$(data.verticalTrackWrapper).unbind('mouseover mouseout');
			}

			if (settings.horizontalScrolling) {
				$(data.horizontalTrackWrapper).unbind('mouseover mouseout');
			}
		}
	},

	startVerticalDrag = function(event) {
		// only handle events for left mouse button dragging
		if (event.which !== 1) { return; }
		
		var pane = event.data.pane,
			data = $(pane).data('enscroll'),
			dragging = true,
			track, handle, handleY, oldHandleY, reqAnimFrame, paneScrollHeight,
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
						setTimeout(moveHandle, 25);
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
					.unbind('mousemove', moveDrag)
					.unbind('mouseup', endDrag);

				registerHoverEvents(pane);
				
				return false;
			};
		
		track = data.verticalTrackWrapper.children[0];
		handle = track.children[0];
		handleY = parseInt(handle.style.top, 10);
		paneScrollHeight = pane.scrollHeight;
		mouseYOffset = event.clientY - $(handle).offset().top;
		handleHeight = $(handle).height();
		trackHeight = $(track).height();
		trackYOffset = $(track).offset().top;
		
		$(doc.body)
			.mousemove(moveDrag)
			.mouseup(function(event) {
				endDrag.call(handle, event)
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
			track, handle, handleX, oldHandleX, reqAnimFrame, paneScrollWidth,
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
						setTimeout(moveHandle, 25);
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
					.unbind('mousemove', moveDrag)
					.unbind('mouseup', endDrag);

				registerHoverEvents(pane);
				
				return false;
			};
			
		track = data.horizontalTrackWrapper.children[0];
		handle = track.children[0];
		handleX = parseInt(handle.style.left, 10);
		paneScrollWidth = pane.scrollWidth;
		mouseXOffset = event.clientX - $(handle).offset().left;
		handleWidth = $(handle).width();
		trackWidth = $(track).width();
		trackXOffset = $(track).offset().left;
		
		$(doc.body)
			.mousemove(moveDrag)
			.mouseup(function(event) {
				endDrag.call(handle, event)
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
				track = data.verticalTrackWrapper.children[0];
				handle = track.children[0];
				pct = $this.scrollTop() / (this.scrollHeight - $this.innerHeight());

				handle.style.top = (pct * ($(track).height() - $(handle).height())) + 'px';
			}

			if (data.settings.horizontalScrolling) {
				track = data.horizontalTrackWrapper.children[0];
				handle = track.children[0];
				pct = $this.scrollLeft() / (this.scrollWidth - $this.innerWidth());

				handle.style.left = (pct * ($(track).width() - $(handle).width())) + 'px';
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

				$this.scrollLeft(scrollLeft + (touchX0 - event.touches[0].clientX))
					.scrollTop(scrollTop + (touchY0 - event.touches[0].clientY));

				if (scrollTop !== $this.scrollTop() ||
					scrollLeft !== $this.scrollLeft()) {
					eventUtility.preventDefault(event);
				}
			},

			touchEnd = function(event) {
				if (this.removeEventListener) {
					this.removeEventListener('touchmove', touchMove, false);
					this.removeEventListener('touchend', touchEnd, false);
				}
			};

		event = eventUtility.getEvent(event);
		if (event.touches.length === 1) {
			if (this.addEventListener) {
				this.addEventListener('touchmove', touchMove, false);
				this.addEventListener('touchend', touchEnd, false);
			}
			touchX = event.touches[0].clientX;
			touchY = event.touches[0].clientY;
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
					trackWrapper, offset, x, y;
				if (data) {
					offset = $this.offset();
					if (data.settings.verticalScrolling) {
						trackWrapper = data.verticalTrackWrapper;
						x = offset.left + $this.outerWidth() - $(trackWrapper).width() - parseInt($this.css('border-right-width'), 10);
						y = offset.top + parseInt($this.css('border-top-width'), 10);
					
						trackWrapper.style.left = x + 'px';
						trackWrapper.style.top = y + 'px';
					}

					if (data.settings.horizontalScrolling) {
						trackWrapper = data.horizontalTrackWrapper;
						x = offset.left + parseInt($this.css('border-left-width'), 10);
						y = offset.top + $this.outerHeight() - $(trackWrapper).height() - parseInt($this.css('border-bottom-width'), 10);

						trackWrapper.style.left = x + 'px';
						trackWrapper.style.top = y + 'px';
					}
				}
			});
		},

		resize: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('enscroll'),
					trackWrapper, pct, track, trackWidth, trackHeight,
					handle, handleWidth, handleHeight;

				if (data) {
					if (data.settings.verticalScrolling) {
						trackWrapper = data.verticalTrackWrapper,
						pct = $this.innerHeight() / this.scrollHeight;
						track = trackWrapper.children[0];
						trackHeight = $(track).height();
						handle = track.children[0];
						handleHeight = Math.max(pct * trackHeight, 25);
						handle.style.height = handleHeight + 'px';
						trackWrapper.style.display = pct < 1 ? 'block' : 'none';
						if (pct < 1) {
							pct = $this.scrollTop() / (this.scrollHeight - $this.height());
							handle.style.top = (pct * (trackHeight - handleHeight)) + 'px';
						}
					}

					if (data.settings.horizontalScrolling) {
						trackWrapper = data.horizontalTrackWrapper;
						pct = $this.innerWidth() / this.scrollWidth;
						track = trackWrapper.children[0];
						trackWidth = $(track).width();
						handle = track.children[0];
						handleWidth = Math.max(pct * trackWidth, 25);

						handle.style.width = handleWidth + 'px';
						trackWrapper.style.display = pct < 1 ? 'block' : 'none';
						if (pct < 1) {
							pct = $this.scrollLeft() / (this.scrollWidth - $this.width());
							handle.style.left = (pct * (trackWidth - handleWidth)) + 'px';
						}
					}
				}

			});
		},

		startPolling: function() {
			return this.each(function() {
				var data = $(this).data('enscroll'),
					pane = this,
					paneWidth, paneHeight, paneOffset,
					paneScrollWidth, paneScrollHeight,

					paneChangeListener = function() {
						if (data.settings.pollChanges) {
							var sw = pane.scrollWidth,
								sh = pane.scrollHeight,
								pw = $(pane).width(),
								ph = $(pane).height(),
								offset = $(pane).offset();

							if (data.settings.verticalScrolling && (ph !== paneHeight || sh !== paneScrollHeight) ||
								data.settings.horizontalScrolling && (pw !== paneWidth || sw !== paneScrollWidth)) {
								paneScrollWidth = sw;
								paneScrollHeight = sh;
								api.resize.apply($(pane));
							}
							
							if (paneOffset.left !== offset.left || paneOffset.top !== offset.top ||
								pw !== paneWidth || ph !== paneHeight) {
								paneOffset = offset;
								paneWidth = pw;
								paneHeight = ph;
								api.reposition.apply($(pane));
							}

							setTimeout(paneChangeListener, 300);
						}
					};
				
				if (data) {
					data.settings.pollChanges = true;
					paneScrollHeight = pane.scrollHeight;
					paneScrollWidth = pane.scrollWidth;
					paneOffset = $(pane).offset();
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

					mouseScrollHandler = data.mouseScrollHandler;

					if (data.settings.verticalScrolling) {
						trackWrapper = data.verticalTrackWrapper;
						trackWidth = data.verticalTrackWidth;
						
						$(trackWrapper).remove();
						trackWrapper = null;

						$(this).css({
							'width': ($this.width() + trackWidth) + 'px',
							'padding-right': (parseInt($this.css('padding-right'), 10) - trackWidth) + 'px',
							'overflow': 'auto'
						});
					}

					if (data.settings.horizontalScrolling) {
						trackWrapper = data.horizontalTrackWrapper;
						trackHeight = data.horizontalTrackHeight;

						$(trackWrapper).remove();
						trackWrapper = null;

						$(this)
							.css({
								'height': ($this.height() + trackHeight) + 'px',
								'padding-bottom': (parseInt($this.css('padding-bottom'), 10) - trackHeight) + 'px',
								'overflow': 'auto'
							})
							.unbind('scroll', data.paneScrollHandler)
							.data('enscroll', {});
					}

					if (this.removeEventListener) {
						this.removeEventListener('mousewheel', mouseScrollHandler, false);
						this.removeEventListener('DOMMouseScroll', mouseScrollHandler, false);
						this.removeEventListener('touchstart', touchStart, false);
					} else if (this.detachEvent) {
						this.detachEvent('onmousewheel', mouseScrollHandler);
					}
					
					$(win).unbind('resize', data.winResizeHandler);
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
			verticalTrackWidth: 16,
			horizontalTrackHeight: 16,
			scrollIncrement: 20,
			verticalTrackClass: 'vertical-track',
			horizontalTrackClass: 'horizontal-track',
			horizontalHandleClass: 'horizontal-handle',
			verticalHandleClass: 'vertical-handle',
			pollChanges: true,
			horizontalHandleHTML: '<div class="left"></div><div class="right"></div>',
			verticalHandleHTML: '<div class="top"></div><div class="bottom"></div>'
		}, opts);
		
		return this.each(function() {

			// only apply this plugin to elements with overflow: auto
			if ($(this).css('overflow') !== 'auto') {
				return;
			}

			var $this = $(this),
				pane = this,
				paneWidth = $this.innerWidth(),
				paneHeight = $this.innerHeight(),
				paneOffset = $this.offset(),
				paneScrollWidth = pane.scrollWidth,
				paneScrollHeight = pane.scrollHeight,
				horizontalTrackWrapper, verticalTrackWrapper,
				horizontalTrack, verticalTrack,
				horizontalHandle, verticalHandle,
				trackHeight, trackWidth,

				// closures to bind events to handlers
				mouseScrollHandler = function(event) {
					mouseScroll.call($this, event);
				},
				paneChangedHandler = function(event) {
					api.resize.call($this);
				},
				winResizeHandler = function(event) {
					api.reposition.call($this);
				},
				paneScrollHandler = function(event) {
					paneScrolled.call(this, event);
				},
				addHandleHTML = function(handle, html) {
					if (typeof html === 'string') {
						$(handle).html(html);
					} else if (typeof html === 'object' && html !== null &&
							html.nodeType && html.nodeType === 1) {
						handle.appendChild(html);
					}
				},
				addHoverEvents = function(wrapper) {
					$(wrapper)
						.css('opacity', 0)
						.mouseover(function(event) {
							showScrollbars.call(pane, event);
						})
						.mouseout(function(event) {
							hideScrollbars.call(pane, event);
						});
				};

			if (settings.verticalScrolling) {
				verticalTrackWrapper = doc.createElement('div');
				verticalTrack = doc.createElement('div');
				verticalHandle = doc.createElement('div');

				// move the content in the pane over to make room for
				// the vertical scrollbar
				$this.css({
					'width': ($this.width() - settings.verticalTrackWidth) + 'px',
					'padding-right': (parseInt($this.css('padding-right'), 10) + settings.verticalTrackWidth) + 'px',
					'overflow': 'hidden'
				});

				trackHeight = settings.horizontalScrolling ?
					paneHeight - settings.horizontalTrackHeight :
					paneHeight;
				
				$(verticalTrack)
					.css({
						'width': '100%',
						'margin': 0,
						'padding': 0,
						'position': 'relative',
						'overflow': 'hidden',
						'height': trackHeight + 'px'
					})
					.addClass(settings.verticalTrackClass)
					.appendTo(verticalTrackWrapper);

				$(verticalHandle)
					.css({
						'width': '100%',
						'position': 'absolute',
						'left': 0,
						'top': 0,
						'margin': 0,
						'padding': 0,
						'cursor': 'pointer'
					})
					.addClass(settings.verticalHandleClass)
					.mousedown({ pane: this }, startVerticalDrag)
					.appendTo(verticalTrack);

				addHandleHTML(verticalHandle, settings.verticalHandleHTML);

				$(verticalTrackWrapper)
					.css({
						'position': 'absolute',
						'width': settings.verticalTrackWidth + 'px',
						'display': 'none',
						'margin': 0,
						'padding': 0
					})
					.insertAfter(this);

				if (settings.showOnHover) {
					addHoverEvents(verticalTrackWrapper);
				}
			}

			if (settings.horizontalScrolling) {
				horizontalTrackWrapper = doc.createElement('div');
				horizontalTrack = doc.createElement('div');
				horizontalHandle = doc.createElement('div');

				$this.css({
					'height': ($this.height() - settings.horizontalTrackHeight) + 'px',
					'padding-bottom': (parseInt($this.css('padding-bottom'), 10) + settings.horizontalTrackHeight) + 'px',
					'overflow': 'hidden'
				});

				trackWidth = settings.verticalScrolling ?
					paneWidth - settings.verticalTrackWidth :
					paneWidth;

				$(horizontalTrack)
					.css({
						'height': '100%',
						'margin': 0,
						'padding': 0,
						'position': 'relative',
						'overflow': 'hidden',
						'width': trackWidth + 'px'
					})
					.addClass(settings.horizontalTrackClass)
					.appendTo(horizontalTrackWrapper);

				$(horizontalHandle)
					.css({
						'height': '100%',
						'position': 'absolute',
						'left': 0,
						'top': 0,
						'margin': 0,
						'padding': 0,
						'cursor': 'pointer'
					})
					.addClass(settings.horizontalHandleClass)
					.mousedown({ pane: this }, startHorizontalDrag)
					.appendTo(horizontalTrack);

				addHandleHTML(horizontalHandle, settings.horizontalHandleHTML);

				$(horizontalTrackWrapper)
					.css({
						'position': 'absolute',
						'height': settings.horizontalTrackHeight + 'px',
						'display': 'none',
						'margin': 0,
						'padding': 0
					})
					.insertAfter(this);
				
				if (settings.showOnHover) {
					addHoverEvents(horizontalTrackWrapper);
				}
			}

			// register an handler that listens for the pane to scroll, and
			// sync the scrollbars' positions
			$this
				.scroll(paneScrollHandler)
				.mouseover(showScrollbars)
				.mouseout(hideScrollbars)
				// store the data we need for handling events and destruction
				.data('enscroll', {
					'settings': settings,
					'horizontalTrackWrapper': horizontalTrackWrapper,
					'verticalTrackWrapper': verticalTrackWrapper,
					'mouseScrollHandler': mouseScrollHandler,
					'paneChangedHandler': paneChangedHandler,
					'winResizeHandler': winResizeHandler,
					'paneScrollHandler': paneScrollHandler
				});

			// reposition the scrollbars if the window is resized
			$(win).resize(winResizeHandler);

			// listen for mouse wheel and touch events and scroll appropriately
			if (this.addEventListener) {
				this.addEventListener('mousewheel', mouseScrollHandler, false);
				this.addEventListener('DOMMouseScroll', mouseScrollHandler, false);
				this.addEventListener('touchstart', touchStart, false);
			} else if (this.attachEvent) {
				// oldie love
				this.attachEvent('onmousewheel', mouseScrollHandler);
			}

			// start polling for changes in dimension and position
			if (settings.pollChanges) {
				api.startPolling.apply($this);
			} else {
				api.resize.call($this);
				api.reposition.call($this);
			}

		});

	}

})(jQuery, window, document);
