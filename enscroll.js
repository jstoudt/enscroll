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
			win.msRequestAnimationFrame;

		startVerticalDrag = function(event) {
			// only handle events for left mouse button dragging
			if (event.which !== 1) { return; }
			
			var pane = event.data.pane,
				data = $(pane).data('enscroll'),
				dragging = true,
				track, handle, handleY, reqAnimFrame, paneScrollHeight,
				mouseYOffset, handleHeight, trackHeight, trackYOffset, bodyCursor,

				moveHandle = function() {
					if (dragging === true) {
						handle.style.top = handleY + 'px';
						$(pane).scrollTop((handleY / (trackHeight - handleHeight)) *
							(paneScrollHeight - trackHeight));

						if (reqAnimFrame) {
							reqAnimFrame(moveHandle);
						} else {
							setTimeout(moveHandle, 25);
						}
					}
				},

				moveDrag = function(event) {
					if (dragging === true) {
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
			
			$(doc.body).mousemove(moveDrag).mouseup(function(event) {
				endDrag.call(handle, event)
			});

			bodyCursor = $('body').css('cursor');
			this.style.cursor = doc.body.style.cursor = 'ns-resize';

			moveHandle();

			return false;
		},

		startHorizontalDrag = function(event) {
			if (event.which !== 1) { return; }

			var pane = event.data.pane,
				data = $(pane).data('enscroll'),
				dragging = true,
				track, handle, handleX, reqAnimFrame, paneScrollWidth,
				mouseXOffset, handleWidth, trackWidth, trackXOffset, bodyCursor,

				moveHandle = function() {
					if (dragging === true) {
						handle.style.left = handleX + 'px';
						$(pane).scrollLeft((handleX / (trackWidth - handleWidth)) *
							(paneScrollWidth - trackWidth));

						if (reqAnimFrame) {
							reqAnimFrame(moveHandle);
						} else {
							setTimeout(moveHandle, 25);
						}
					}
				},

				moveDrag = function(event) {
					if (dragging === true) {
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
			
			$(doc.body).mousemove(moveDrag).mouseup(function(event) {
				endDrag.call(handle, event)
			});

			bodyCursor = $('body').css('cursor');
			this.style.cursor = doc.body.style.cursor = 'ew-resize';

			moveHandle();

			return false;

		},

		mouseScroll = function(event) {
			event = eventUtility.getEvent(event);
			var scrollTop0 = this.scrollTop(),
				delta = (event.detail) ? -event.detail :
					(typeof client !== 'undefined' && client.engine.opera && client.engine.opera < 9.5) ? -event.wheelDelta :
					event.wheelDelta,
				scrollIncrement = $(this).data('enscroll').settings.scrollIncrement;

			if (delta < 0) {
				this.scrollTop(scrollTop0 + scrollIncrement);
			} else {
				this.scrollTop(scrollTop0 - scrollIncrement);
			}

			if (scrollTop0 !== this.scrollTop()) {
				eventUtility.preventDefault(event);
			}
		},

		paneScrolled = function(event) {
			var data = $(this).data('enscroll'),
				$this, handle, track, pct;

			if (data) {
				$this = $(this);
				track = data.verticalTrackWrapper.children[0];
				handle = track.children[0];
				pct = $this.scrollTop() / (this.scrollHeight - $this.height());

				$(handle).css('top', (pct * ($(track).height() - $(handle).height())) + 'px');
			}
		},

		touchStart = function(event) {
			event = eventUtility.getEvent(event);
			if (event.touches.length === 1) {
				touchY = event.touches[0].clientY;
				eventUtility.eventDefault(event);
			}
		},

		touchMove = function(event) {
			event = eventUtility.getEvent(event);
			if (event.touches.length === 1) {
				var touchY0 = touchY,
					scrollTop = $(this).scrollTop();
				touchY = event.touches[0].clientY;
				$(this).scrollTop(scrollTop + (touchY0 - touchY));

				if (scrollTop !== $(this).scrollTop()) {
					eventUtility.preventDefault(event);
				}
			}
		},

	api = {
		reposition: function() {
			return this.each(function() {
				var data = $(this).data('enscroll'),
					trackWrapper, offset, x, y;
				if (data) {
					offset = $(this).offset();
					if (data.settings.verticalScrolling) {
						trackWrapper = data.verticalTrackWrapper;
						x = Math.round(offset.left) + $(this).outerWidth() - $(trackWrapper).width() - parseInt($(this).css('border-right-width'), 10);
						y = Math.round(offset.top) + parseInt($(this).css('border-top-width'), 10);
					
						trackWrapper.style.left = x + 'px';
						trackWrapper.style.top = y + 'px';
					}

					if (data.settings.horizontalScrolling) {
						trackWrapper = data.horizontalTrackWrapper;
						x = offset.left + parseInt($(this).css('border-left-width'), 10);
						y = offset.top + $(this).outerHeight() - $(trackWrapper).height() - parseInt($(this).css('border-bottom-width'), 10);

						trackWrapper.style.left = x + 'px';
						trackWrapper.style.top = y + 'px';
					}
				}
			});
		},

		resize: function() {
			return this.each(function() {
				var data = $(this).data('enscroll'),
					trackWrapper, pct, track, handle, handleWidth, handleHeight;
				if (data) {
					if (data.settings.verticalScrolling === true) {
						trackWrapper = data.verticalTrackWrapper,
						pct = $(this).innerHeight() / this.scrollHeight;
						track = trackWrapper.children[0];
						handle = track.children[0];
					
						handleHeight = Math.round(Math.max(pct * $(track).height(), 25));
					
						handle.style.height = handleHeight + 'px';
						trackWrapper.style.display = (pct < 1) ? 'block' : 'none';

						pct = $(this).scrollTop() / (this.scrollHeight - $(this).height());
						handle.style.top = (pct * ($(track).height() - $(handle).height())) + 'px';
					}

					if (data.settings.horizontalScrolling === true) {
						trackWrapper = data.horizontalTrackWrapper;
						pct = $(this).innerWidth() / this.scrollWidth;
						track = trackWrapper.children[0];
						handle = track.children[0];

						handleWidth = Math.round(Math.max(pct * $(track).width(), 25));

						handle.style.width = handleWidth + 'px';
						trackWrapper.style.display = (pct < 1) ? 'block' : 'none';

						pct = $(this).scrollLeft() / (this.scrollWidth - $(this).width());
						handle.style.left = (pct * ($(track).width() - $(handle).width())) + 'px';
					}
				}
			});
		},

		startPolling: function() {
			return this.each(function() {
				var data = $(this).data('enscroll'),
					pane = this,
					paneScrollWidth, paneScrollHeight, paneOffset;
				
				if (data) {
					data.settings.pollChanges = true;
					paneScrollHeight = pane.scrollHeight;
					paneScrollWidth = pane.scrollWidth;
					paneOffset = $(pane).offset();

					(function paneChangeTimer() {
						if (data.settings.pollChanges === true) {
							var sw = pane.scrollWidth,
								sh = pane.scrollHeight,
								offset = $(pane).offset();

							if (data.settings.verticalScrolling === true && sh !== paneScrollHeight ||
								data.settings.horizontalScrolling === true && sw !== paneScrollWidth) {
								paneScrollWidth = sw;
								paneScrollHeight = sh;
								api.resize.apply($(pane));
							}
							
							if (paneOffset.left !== offset.left || paneOffset.top !== offset.top) {
								paneOffset = offset;
								api.reposition.apply($(pane));
							}

							setTimeout(paneChangeTimer, 300);
						}
					})();
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

		destroy: function(undefined) {
			return this.each(function() {
				var data = $(this).data('enscroll');
					trackWrapper = data.trackWrapper
					trackWidth, mouseScrollHandler;
				if (trackWrapper) {
					trackWidth = $(trackWrapper).width();
					mouseScrollHandler = data.mouseScrollHandler;

					$(trackWrapper).remove();
					$trackWrapper = null;

					$(this).css({
						'width': ($(this).width() + trackWidth) + 'px',
						'padding-right': ($(this).css('padding-right') - trackWidth) + 'px',
						'overflow': 'auto'
					});

					
					if (this.removeEventListener) {
						this.removeEventListener('mousewheel', mouseScrollHandler, false);
						this.removeEventListener('DOMMouseScroll', mouseScrollHandler, false);
						this.removeEventListener('touchstart', touchStart, false);
						this.removeEventListener('touchmove', touchMove, false);
					} else if (this.detachEvent) {
						this.detachEvent('onmousewheel', mouseScrollHandler);
					}

					$(win).unbind('resize', data.winResizeHandler);
					$(this).unbind('scroll', data.paneScrollHandler);

					$(this).data('enscroll', undefined);
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
			verticalTrackWidth: 16,
			horizontalTrackHeight: 16,
			scrollIncrement: 20,
			verticalTrackClass: 'vertical-track',
			horizontalTrackClass: 'horizontal-track',
			horizontalHandleClass: 'horizontal-handle',
			verticalHandleClass: 'vertical-handle',
			pollChanges: true
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
				};

			if (settings.verticalScrolling === true) {
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

				trackHeight = settings.horizontalScrolling === true ?
					paneHeight - settings.horizontalTrackHeight :
					paneHeight;
				
				$(verticalTrack)
				.css({
					'width': '100%',
					'margin': 0,
					'padding': 0,
					'position': 'relative',
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

				$(verticalTrackWrapper)
				.css({
					'position': 'absolute',
					'width': settings.verticalTrackWidth + 'px',
					'display': 'none'
				})
				.insertAfter(this);
			}

			if (settings.horizontalScrolling === true) {
				horizontalTrackWrapper = doc.createElement('div');
				horizontalTrack = doc.createElement('div');
				horizontalHandle = doc.createElement('div');

				$this.css({
					'height': ($this.height() - settings.horizontalTrackHeight) + 'px',
					'padding-bottom': (parseInt($this.css('padding-bottom'), 10) + settings.horizontalTrackHeight) + 'px',
					'overflow': 'hidden'
				});

				trackWidth = settings.verticalScrolling === true ?
					paneWidth - settings.verticalTrackWidth :
					paneWidth;

				$(horizontalTrack)
				.css({
					'height': '100%',
					'margin': 0,
					'padding': 0,
					'position': 'relative',
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

				$(horizontalTrackWrapper)
				.css({
					'position': 'absolute',
					'height': settings.horizontalTrackHeight + 'px',
					'display': 'none'
				})
				.insertAfter(this);
			}

			// register an handler that listens for the pane to scroll, and
			// sync the scrollbars' positions
			$this.bind('scroll', paneScrollHandler)
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
				this.addEventListener('touchmove', touchMove, false);
			} else if (this.attachEvent) {
				// oldie love
				this.attachEvent('onmousewheel', mouseScrollHandler);
			}

			if (settings.pollChanges === true) {
				api.startPolling.apply($this);
			}

			api.resize.apply($this);
			api.reposition.apply($this);

		});

	}

})(jQuery, window, document);
