/*
 * enscroll.js
 */

(function($, win, doc) {

	var api = {
		reposition: function() {
			
			return this.each(function() {
				if (this.trackWrapper) {
					var track = this.trackWrapper,
						offset = $(this).offset(),
						x = Math.round(offset.left) + $(this).outerWidth() - $(track).width() - parseInt($(this).css('border-right-width'), 10),
						y = Math.round(offset.top) + parseInt($(this).css('border-top-width'), 10);
					
					track.style.left = x + 'px';
					track.style.top = y + 'px';
				}
			});
		},

		resize: function() {
			return this.each(function() {
				if (this.trackWrapper) {
					var trackWrapper = this.trackWrapper,
						pct = $(this).innerHeight() / this.scrollHeight,
						track = trackWrapper.children[0],
						handle = track.children[0],
						handleHeight = Math.round(Math.max(pct * $(track).height(), 25));
					
					handle.style.height = handleHeight + 'px';
					trackWrapper.style.display = (pct < 1) ? 'block' : 'none';

					pct = $(this).scrollTop() / (this.scrollHeight - $(this).height());
					handle.style.top = (pct * ($(track).height() - $(handle).height())) + 'px';
				}
			});
		}
	};

	$.fn.enscroll = function(opts) {

		// handle API method calls
		if (typeof opts === 'string') {
			if (opts === 'reposition') {
				return api.reposition.apply(this, arguments);
			} else if (opts === 'resize') {
				return api.resize.apply(this, arguments);
			}
		}

		// use default settings, and overwrite defaults with options passed in
		var settings = $.extend({
			trackWidth: 16,
			scrollIncrement: 20,
			trackClass: 'track',
			handleClass: 'handle',
			pollChanges: true
		}, opts),

			mouseYOffset, // y-offset of mouse-down on the handle

			handle, // a reference to the handle element

			handleY, // the current y-offset position of the handle

			handleHeight, // the height of the handle

			trackHeight, // the height of the track

			trackYOffset, // y-offset of the track relative to the document

			pane, // a reference to the target pane

			paneScrollHeight, // the total height of the target pane

			touchY, // the document-relative y-coordinate of a touch event

			dragging = false, // true when the mouse button is depressed

			bodyCursor = null, // the value of the cursor CSS property on the body

			eventUtility = {
				
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

			startDrag = function(event) {
				// only enScroll for left mouse button down events
				if (event.which !== 1) {
					return true;
				}
				handle = event.target;
				handleY = parseInt(handle.style.top, 10);
				var track = handle.parentNode,
					that = this,
					reqAnimFrame = win.requestAnimationFrame ||
						win.mozRequestAnimationFrame ||
						win.webkitRequestAnimationFrame ||
						win.msRequestAnimationFrame;
				pane = event.data.pane;
				paneScrollHeight = pane.scrollHeight;
				mouseYOffset = event.clientY - Math.round($(handle).offset().top);
				handleHeight = $(handle).height();
				trackHeight = $(track).height();
				trackYOffset = $(track).offset().top;
				dragging = true;
				$(doc.body).mousemove(moveDrag).mouseup(function(event) {
					endDrag.call(that, event)
				});
				(function moveHandle() {
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
				})();
				bodyCursor = $('body').css('cursor');
				this.style.cursor = doc.body.style.cursor = 'ns-resize';
				return false;
			},

			moveDrag = function(event) {
				if (dragging !== true) {
					return false;
				}
				handleY = event.clientY - trackYOffset - mouseYOffset;
				handleY = Math.max(0, Math.min(handleY, trackHeight - handleHeight));
				return false;
			},

			endDrag = function(event) {
				doc.body.style.cursor = bodyCursor;
				this.style.cursor = 'pointer';
				dragging = false;
				$(doc.body).unbind('mousemove', moveDrag).unbind('mouseup', endDrag);
				return false;
			},

			mouseScroll = function(event) {
				event = eventUtility.getEvent(event);
				var scrollTop0 = this.scrollTop(),
					delta = (event.detail) ? -event.detail :
						(typeof client !== 'undefined' && client.engine.opera && client.engine.opera < 9.5) ? -event.wheelDelta :
						event.wheelDelta;	

				if (delta < 0) {
					this.scrollTop(scrollTop0 + settings.scrollIncrement);
				} else {
					this.scrollTop(scrollTop0 - settings.scrollIncrement);
				}

				if (scrollTop0 !== this.scrollTop()) {
					eventUtility.preventDefault(event);
				}
			},

			paneScrolled = function(event) {
				var handle = event.data.handle,
					track = event.data.track,
					pct = $(this).scrollTop() / (this.scrollHeight - $(this).height());
				$(handle).css('top', (pct * ($(track).height() - $(handle).height())) + 'px');
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
			};
		
		return this.each(function() {

			// only apply this plugin to elements with overflow: auto
			if ($(this).css('overflow') !== 'auto') { return; }

			var $this = $(this),
				pane = this,
				paneHeight = $this.innerHeight(),
				paneOffset = $this.offset(),
				paneScrollHeight = pane.scrollHeight,
				parent = $this.parentNode,
				trackWrapper = doc.createElement('div'),
				track = doc.createElement('div'),
				handle = doc.createElement('div'),
				bindMouseScroll = function(event) {
					mouseScroll.call($this, event);
				},
				bindPaneChanged = function(event) {
					api.resize.apply($this);
				};

			this.trackWrapper = trackWrapper;

			$this.css({
				'width': ($this.width() - settings.trackWidth) + 'px',
				'padding-right': (parseInt($this.css('padding-right'), 10) + settings.trackWidth) + 'px',
				'overflow': 'hidden'
			}).scroll(function(event) {
				event.data = event.data || {};
				event.data.track = track;
				event.data.handle = handle;
				paneScrolled.call(this, event);
			});

			$(win).resize(function() {
				api.reposition.apply($this);
			});

			if (this.addEventListener) {
				this.addEventListener('mousewheel', bindMouseScroll, false);
				this.addEventListener('DOMMouseScroll', bindMouseScroll, false);
				this.addEventListener('touchstart', touchStart, false);
				this.addEventListener('touchmove', touchMove, false);
			} else if (this.attachEvent) {
				this.attachEvent('onmousewheel', bindMouseScroll);
			}

			$(track).addClass(settings.trackClass).css({
				'width': '100%',
				'margin': 0,
				'padding': 0,
				'position': 'relative',
				'height': paneHeight + 'px'
			}).appendTo(trackWrapper);

			$(handle).css({
				'width': '100%',
				'position': 'absolute',
				'left': 0,
				'top': 0,
				'margin': 0,
				'padding': 0,
				'cursor': 'pointer'
			})
			.addClass(settings.handleClass)
			.appendTo(track)
			.mousedown({pane: this}, startDrag);

			$(trackWrapper).css({
				'position': 'absolute',
				'width': settings.trackWidth + 'px',
				'display': 'none'
			}).insertAfter(this);

			if (settings.pollChanges === true) {

				(function() {
					var sh = pane.scrollHeight,
						offset = $(pane).offset();
					if (sh !== paneScrollHeight) {
						paneScrollHeight = sh;
						api.resize.apply($this);
					}
					if (paneOffset.left !== offset.left || paneOffset.top !== offset.top) {
						paneOffset = offset;
						api.reposition.apply($this);
					}

					if (settings.pollChanges === true) {
						setTimeout(arguments.callee, 300);
					}

				})();

			}

			api.resize.apply($this);
			api.reposition.apply($this);

		});

	}

})(jQuery, window, document);
