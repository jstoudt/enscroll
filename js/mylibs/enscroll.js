/*global jQuery:false*/

/**
 * enscroll.js - jQuery plugin to add custom scrollbars to HTML block elements
 * Copyright (C) 2012 Jason T. Stoudt
 * Released under the MIT license
 * http://enscrollplugin.com/license.html
 **/

;(function( $, win, doc, undefined ) {

	var defaultSettings = {
		verticalScrolling: true,
		horizontalScrolling: false,
        verticalScrollerSide: 'right',
		showOnHover: false,
		scrollIncrement: 20,
		minScrollbarLength: 40,
		pollChanges: true,
		drawCorner: true,
		drawScrollButtons: false,
		clickTrackToScroll: true,
		easingDuration: 500,
		propagateWheelEvent: true,
		verticalTrackClass: 'vertical-track',
		horizontalTrackClass: 'horizontal-track',
		horizontalHandleClass: 'horizontal-handle',
		verticalHandleClass: 'vertical-handle',
		scrollUpButtonClass: 'scroll-up-btn',
		scrollDownButtonClass: 'scroll-down-btn',
		scrollLeftButtonClass: 'scroll-left-btn',
		scrollRightButtonClass: 'scroll-right-btn',
		cornerClass: 'scrollbar-corner',
		zIndex: 1,
		addPaddingToPane: true,
		horizontalHandleHTML: '<div class="left"></div><div class="right"></div>',
		verticalHandleHTML: '<div class="top"></div><div class="bottom"></div>'
	},

	preventDefault = function( event ) {
		if ( event.preventDefault ) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}

		if ( event.stopPropagation ) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
	},

	// normalize requestAnimationFrame function and polyfill if needed
	reqAnimFrame = win.requestAnimationFrame ||
			win.mozRequestAnimationFrame ||
			win.webkitRequestAnimationFrame ||
			win.oRequestAnimationFrame ||
			win.msRequestAnimationFrame ||
			function( f ) { setTimeout( f, 17 ); },

	getComputedValue = function( elem, property ) {
		var w = $( elem ).css( property ),
			matches = /^-?\d+/.exec( w );
		return matches ? +matches[0] : 0;
	},

	testScrollHeight = function( nodeName ) {
		var styles = {
				width: '5px',
				height: '1px',
				overflow: 'hidden',
				padding: '8px 0',
				visibility: 'hidden',
				whiteSpace: 'pre-line',
				font: '10px/1 serif'
			},
			pane = document.createElement( nodeName ),
			textNode = document.createTextNode( 'a\na' ),
			result, attr;

		for ( attr in styles ) {
			pane.style[ attr ] = styles[ attr ];
		}

		pane.appendChild( textNode );
		document.body.appendChild( pane );

		result = ( pane.scrollHeight < 28 );

		document.body.removeChild( pane );

		return result;
	},

	PI_OVER_2 = 0.5 * Math.PI,

	TEN_LOG2 = 10 * Math.log( 2 ),

	easeOutSin = function( c, d, t ) {
		var b = PI_OVER_2 / d,
			a = c * b;

		return Math.round( a * Math.cos( b * t ));
	},

	easeOutExpo = function( c, d, t ) {
		return Math.round( c * TEN_LOG2 * Math.pow( 2, -10 * t / d + 1 ) / d );
	},

	timeFromPosition = function( b, c, d, x ) {
		return 2 * d / Math.PI * Math.asin(( x - b ) / c );
	},

	showScrollbars = function( scheduleHide ) {
		var data = $( this ).data( 'enscroll' ),
			that = this,
			settings = data.settings,
			hideScrollbars = function() {
				var data = $( this ).data( 'enscroll' ),
					settings = data.settings;

				if ( data && settings.showOnHover ) {
					if ( settings.verticalScrolling &&
						$( data.verticalTrackWrapper ).is( ':visible' )) {
						$( data.verticalTrackWrapper ).stop().fadeTo( 275, 0 );
					}

					if ( settings.horizontalScrolling &&
						$( data.horizontalTrackWrapper ).is( ':visible' )) {
						$( data.horizontalTrackWrapper ).stop().fadeTo( 275, 0 );
					}
					data._fadeTimer = null;
				}
			};

		if ( data && settings.showOnHover ) {
			if ( data._fadeTimer ) {
				clearTimeout( data._fadeTimer );
			} else {
				if ( settings.verticalScrolling &&
					$( data.verticalTrackWrapper ).is( ':visible' )) {
					$( data.verticalTrackWrapper ).stop().fadeTo( 275, 1 );
				}

				if ( settings.horizontalScrolling &&
					$( data.horizontalTrackWrapper ).is( ':visible' )) {
					$( data.horizontalTrackWrapper ).stop().fadeTo( 275, 1 );
				}
			}

			if ( scheduleHide !== false ) {
				data._fadeTimer = setTimeout(function() {
					hideScrollbars.call( that );
				}, 1750);
			}
		}
	},

	scrollVertical = function( pane, dy ) {
		var $pane = $( pane ),
			data = $pane.data( 'enscroll' ),
			y0 = $pane.scrollTop();

		if ( data && data.settings.verticalScrolling ) {
			$pane.scrollTop( y0 + dy );
			if ( data.settings.showOnHover ) {
				showScrollbars.call( pane );
			}
		}
	},

	scrollHorizontal = function( pane, dx ) {
		var $pane = $( pane ),
			data = $pane.data( 'enscroll' ),
			x0 = $pane.scrollLeft();
		if ( data && data.settings.horizontalScrolling ) {
			$pane.scrollLeft( x0 + dx );
			if ( data.settings.showOnHover ) {
				showScrollbars.call( pane );
			}
		}
	},

	startVerticalDrag = function( event ) {
		// only handle events for left mouse button dragging
		if ( event.which !== 1 ) {
			return;
		}

		var pane = event.data.pane,
			$pane = $( pane ),
			data = $pane.data( 'enscroll' ),
			dragging = true,
			$track, handle, handleY, oldHandleY, mouseYOffset,
			trackYOffset, bodyCursor, trackDiff, paneDiff,

			moveHandle = function() {
				if ( !dragging ) {
					return;
				}

				if ( handleY !== oldHandleY ) {
					if ( !data._scrollingY ) {
						data._scrollingY = true;
						data._startY = $pane.scrollTop();
						reqAnimFrame( function() {
							scrollAnimate( $pane );
						});
					}

					handle.style.top = handleY + 'px';

					data._endY = handleY * paneDiff / trackDiff;
					oldHandleY = handleY;
				}

				reqAnimFrame( moveHandle );

				if ( data.settings.showOnHover ) {
					showScrollbars.call( pane );
				}
			},

			moveDrag = function( event ) {
				if ( dragging ) {
					handleY = event.clientY - trackYOffset - mouseYOffset;
					handleY = Math.min( handleY < 0 ? 0 : handleY, trackDiff );
				}
				return false;
			},

			endDrag = function() {
				dragging = false;

				doc.body.style.cursor = bodyCursor;
				this.style.cursor = '';
				$track.removeClass( 'dragging' );

				$( doc.body )
					.off( 'mousemove.enscroll.vertical' )
					.off( 'mouseup.enscroll.vertical' );

				$( doc ).off( 'mouseout.enscroll.vertical' );

				$pane.on( 'scroll.enscroll.pane', function( event ) {
					paneScrolled.call( this, event );
				});

				return false;
			};

		$track = $( data.verticalTrackWrapper ).find( '.enscroll-track' );
		handle = $track.children().first()[0];
		handleY = parseInt( handle.style.top, 10 );
		paneDiff = pane.scrollHeight -
			(data._scrollHeightNoPadding ? $(pane).height() : $(pane).innerHeight());

		mouseYOffset = event.clientY - $( handle ).offset().top;
		trackDiff = $track.height() - $( handle ).outerHeight();
		trackYOffset = $track.offset().top;

		$pane.off( 'scroll.enscroll.pane' );

		$( doc.body ).on({
			'mousemove.enscroll.vertical': moveDrag,
			'mouseup.enscroll.vertical': function( event ) {
				endDrag.call( handle, event );
			}
		});

		$( doc ).on( 'mouseout.enscroll.vertical', function( event ) {
			if ( event.target.nodeName && event.target.nodeName.toUpperCase() === 'HTML' ) {
				endDrag.call( handle, event );
			}
		});

		if ( !$track.hasClass( 'dragging' ) ) {
			$track.addClass( 'dragging' );
			bodyCursor = $( doc.body ).css( 'cursor' );
			this.style.cursor = doc.body.style.cursor = 'ns-resize';
		}

		reqAnimFrame( moveHandle );

		return false;
	},

	startHorizontalDrag = function( event ) {
		// dragging the scrollbar handle only works with left mouse button
		if ( event.which !== 1 ) {
			return;
		}

		var pane = event.data.pane,
			$pane = $( pane ),
			data = $( pane ).data( 'enscroll' ),
			dragging = true,
			$track, handle, handleX, oldHandleX, paneDiff,
			mouseXOffset, trackXOffset, bodyCursor, trackDiff,

			moveHandle = function() {
				if ( !dragging ) {
					return;
				}

				if ( handleX !== oldHandleX ) {
					if ( !data._scrollingX ) {
						data._scrollingX = true;
						data._startX = $pane.scrollLeft();
						reqAnimFrame( function() {
							scrollAnimate( $pane );
						});
					}

					handle.style.left = handleX + 'px';

					data._endX = handleX * paneDiff / trackDiff;
					oldHandleX = handleX;
				}

				reqAnimFrame( moveHandle );

				if ( data.settings.showOnHover ) {
					showScrollbars.call( pane );
				}
			},

			moveDrag = function( event ) {
				if ( dragging ) {
					handleX = event.clientX - trackXOffset - mouseXOffset;
					handleX = Math.min( handleX < 0 ? 0 : handleX, trackDiff );
				}
				return false;
			},

			endDrag = function() {
				dragging = false;

				$track.removeClass('dragging');

				doc.body.style.cursor = bodyCursor;
				this.style.cursor = '';
				$track.removeClass( 'dragging' );

				$( doc.body )
					.off( 'mousemove.enscroll.horizontal' )
					.off( 'mouseup.enscroll.horizontal' );

				$( doc ).off ( 'mouseout.enscroll.horizontal' );

				$pane.on( 'scroll.enscroll.pane', function( event ) {
					paneScrolled.call( this, event );
				});

				return false;
			};

		$track = $( data.horizontalTrackWrapper ).find( '.enscroll-track' );
		handle = $track.children().first()[0];
		handleX = parseInt( handle.style.left, 10 );
		paneDiff = pane.scrollWidth - $( pane ).innerWidth();
		mouseXOffset = event.clientX - $( handle ).offset().left;
		trackDiff = $track.width() - $( handle ).outerWidth();
		trackXOffset = $track.offset().left;

		$pane.off( 'scroll.enscroll.pane' );

		$( doc.body ).on({
			'mousemove.enscroll.horizontal': moveDrag,
			'mouseup.enscroll.horizontal': function( event ) {
				endDrag.call( handle, event );
			}
		});

		$( doc ).on( 'mouseout.enscroll.horizontal', function( event ) {
			if ( event.target.nodeName && event.target.nodeName.toUpperCase() === 'HTML' ) {
				endDrag.call( handle, event );
			}
		});

		if ( !$track.hasClass( 'dragging' ) ) {
			$track.addClass( 'dragging' );
			bodyCursor = $( 'body' ).css( 'cursor' );
			this.style.cursor = doc.body.style.cursor = 'ew-resize';
		}

		reqAnimFrame( moveHandle );

		return false;

	},

	scrollAnimate = function( $pane ) {
		var data = $pane.data( 'enscroll' ),
			d = data._duration,
			c, curPos, t;

		if ( data._scrollingX === true ) {
			c = data._endX - data._startX;
			if ( c === 0 ) {
				data._scrollingX = false;
			} else {
				curPos = $pane.scrollLeft();
				t = timeFromPosition( data._startX, c, d, curPos );
				if ( c > 0 ) {
					if ( curPos >= data._endX || curPos < data._startX ) {
						data._scrollingX = false;
					} else {
						scrollHorizontal( $pane,
							Math.max( 1, easeOutSin( c, d, t )));
						reqAnimFrame( function() {
							scrollAnimate( $pane );
						});
					}
				} else {
					if ( curPos <= data._endX || curPos > data._startX ) {
						data._scrollingX = false;
					} else {
						scrollHorizontal( $pane,
							Math.min( -1, easeOutSin( c, d, t )));
						reqAnimFrame( function() {
							scrollAnimate( $pane );
						});
					}
				}
			}
		}

		if ( data._scrollingY === true ) {
			c = data._endY - data._startY;
			if ( c === 0 ) {
				data._scrollingY = false;
			} else {
				curPos = $pane.scrollTop();
				t = timeFromPosition( data._startY, c, d, curPos );
				if ( c > 0 ) {
					if ( curPos >= data._endY || curPos < data._startY ) {
						data._scrollingY = false;
					} else {
						scrollVertical( $pane,
							Math.max( 1, easeOutSin( c, d, t )));
						reqAnimFrame( function() {
							scrollAnimate( $pane );
						});
					}
				} else {
					if ( curPos <= data._endY || curPos > data._startY ) {
						data._scrollingY = false;
					} else {
						scrollVertical( $pane,
							Math.min( -1, easeOutSin( c, d, t )));
						reqAnimFrame( function() {
							scrollAnimate( $pane );
						});
					}
				}
			}
		}

	},

	scrollAnimateHorizontal = function( $pane, delta ) {
		var data = $pane.data( 'enscroll' ),
			curPos = $pane.scrollLeft(),
			scrollMax = $pane[0].scrollWidth - $pane.innerWidth();

		if ( !data.settings.horizontalScrolling || data._scrollingY ) {
			return false;
		}

		if ( !data._scrollingX ) {
			data._scrollingX = true;
			data._startX = curPos;
			data._endX = data._startX;
			reqAnimFrame( function() {
				scrollAnimate( $pane );
			});
		}

		data._endX = delta > 0 ? Math.min( curPos + delta, scrollMax ) :
			Math.max( 0, curPos + delta );

		return delta < 0 && curPos > 0 || delta > 0 && curPos < scrollMax;
	},

	scrollAnimateVertical = function( $pane, delta ) {
		var data = $pane.data( 'enscroll' ),
			curPos = $pane.scrollTop(),
			scrollMax = $pane[0].scrollHeight - (data._scrollHeightNoPadding ? $pane.height() : $pane.innerHeight());

		if ( !data.settings.verticalScrolling || data._scrollingX ) {
			return false;
		}

		if ( !data._scrollingY ) {
			data._scrollingY = true;
			data._startY = curPos;
			data._endY = data._startY;
			reqAnimFrame( function() {
				scrollAnimate( $pane );
			});
		}

		data._endY = delta > 0 ? Math.min( curPos + delta, scrollMax ) :
			Math.max( 0, curPos + delta );

		return delta < 0 && curPos > 0 || delta > 0 && curPos < scrollMax;
	},

	mouseScroll = function( event ) {
		var $pane = $( this ),
			data = $pane.data( 'enscroll' ),
			scrollIncrement = data.settings.scrollIncrement,
			deltaX = 'deltaX' in event ? -event.deltaX :
				'wheelDeltaX' in event ? event.wheelDeltaX :
				0,
			deltaY = 'deltaY' in event ? -event.deltaY :
				'wheelDeltaY' in event ? event.wheelDeltaY :
				'wheelDelta' in event ? event.wheelDelta :
				0,
			delta;

		if ( Math.abs( deltaX ) > Math.abs( deltaY )) {
			delta = ( deltaX > 0 ? -scrollIncrement : scrollIncrement ) << 2;
			if ( scrollAnimateHorizontal( $pane, delta ) || !data.settings.propagateWheelEvent ) {
				preventDefault( event );
			}
		} else {
			delta = ( deltaY > 0 ? -scrollIncrement : scrollIncrement ) << 2;
			if ( scrollAnimateVertical( $pane, delta ) || !data.settings.propagateWheelEvent ) {
				preventDefault( event );
			}
		}
	},

	paneScrolled = function() {
		var $this = $( this ),
			data = $this.data( 'enscroll' ),
			handle, track, pct;

		if ( data ) {
			if ( data.settings.verticalScrolling ) {
				track = $( data.verticalTrackWrapper ).find( '.enscroll-track' )[0];
				handle = track.firstChild;
				pct = $this.scrollTop() / ( this.scrollHeight - (data._scrollHeightNoPadding ? $this.height() : $this.innerHeight()));
				pct = isNaN( pct ) ? 0 : pct;

				handle.style.top = ( pct * ( $( track ).height() - $( handle ).outerHeight() )) + 'px';
			}

			if ( data.settings.horizontalScrolling ) {
				track = $( data.horizontalTrackWrapper ).find( '.enscroll-track' )[0];
				handle = track.firstChild;
				pct = $this.scrollLeft() / ( this.scrollWidth - $this.innerWidth() );
				pct = isNaN( pct ) ? 0 : pct;

				handle.style.left = ( pct * ( $( track ).width() - $( handle ).innerWidth() )) + 'px';
			}
		}
	},

	keyHandler = function( event ) {
		var $this = $( this ),
			data = $this.data( 'enscroll' ),
			scrollIncrement;

		// dont' have key events if this element is a user-input element
		if (/(input)|(select)|(textarea)/i.test( this.nodeName )) {
			return;
		}

		// don't handle events that have just bubbled up
		if ( event.target === this && data ) {
			scrollIncrement = data.settings.scrollIncrement;

			switch( event.keyCode ) {
				case 32: // space
				case 34: // page down
					scrollAnimateVertical( $this, $this.height() );
					return false;
				case 33: // page up
					scrollAnimateVertical( $this, -$this.height() );
					return false;
				case 35: // end
					scrollAnimateVertical( $this, this.scrollHeight );
					return false;
				case 36: // home
					scrollAnimateVertical( $this, -this.scrollHeight );
					return false;
				case 37: // left
					scrollAnimateHorizontal( $this, -scrollIncrement );
					return false;
				case 38: // up
					scrollAnimateVertical( $this, -scrollIncrement );
					return false;
				case 39: // right
					scrollAnimateHorizontal( $this, scrollIncrement );
					return false;
				case 40: // down
					scrollAnimateVertical( $this, scrollIncrement );
					return false;
			}

			return true;
		}
	},

	dragHandler = function() {
		var pane = this,
			settings = $( pane ).data( 'enscroll' ).settings,
			dragging = true,
			deltaX = 0,
			deltaY = 0,
			paneTop = $( pane ).offset().top,
			paneBottom = paneTop + $( pane ).outerHeight(),
			paneLeft = $( pane ).offset().left,
			paneRight = paneLeft + $( pane ).outerWidth(),
			dragMove = function( event ) {
				var x = event.pageX,
					y = event.pageY;

				deltaX = x < paneLeft ? x - paneLeft :
					x > paneRight ? x - paneRight :
					0;

				deltaY = y < paneTop ? y - paneTop :
					y > paneBottom ? y - paneBottom :
					0;
			},

			dragPoll = function() {
				if ( settings.horizontalScrolling && deltaX ) {
					scrollHorizontal(pane, parseInt( deltaX / 4, 10 ));
				}
				if ( settings.verticalScrolling && deltaY ) {
					scrollVertical( pane, parseInt( deltaY / 4, 10 ));
				}
				if ( dragging ) {
					reqAnimFrame( dragPoll );
				}
			},

			dragEnd = function() {
				dragging = false;
				$( doc )
					.off( 'mousemove.enscroll.pane' )
					.off( 'mouseup.enscroll.pane' );
			};

		reqAnimFrame( dragPoll );

		$( doc ).on({
			'mousemove.enscroll.pane': dragMove,
			'mouseup.enscroll.pane': dragEnd
		});
	},

	touchStart = function( event ) {
		var touchX, touchY, touchAxis, touchX0, touchY0, touchStarted, touchDelta,
			pane = this,
			touchMove = function( event ) {
				touchX = event.touches[0].clientX;
				touchY = event.touches[0].clientY;

				if ( !touchAxis ) {
					touchAxis = touchY === touchY0 && touchX === touchX0 ? undefined :
						Math.abs( touchY0 - touchY ) > Math.abs( touchX0 - touchX ) ? 'y' :
						'x';
				}

				preventDefault( event );
			},

			touchPoll = function() {
				if ( !touchStarted ) {
					return;
				}

				if ( touchAxis === 'y' ) {
					scrollVertical( pane, touchY0 - touchY );
					touchDelta = touchY0 - touchY;
					touchY0 = touchY;
				} else if ( touchAxis === 'x' ) {
					scrollHorizontal( pane, touchX0 - touchX );
					touchDelta = touchX0 - touchX;
					touchX0 = touchX;
				}

				reqAnimFrame( touchPoll );
			},

			touchEnd = function() {
				var t = 0,
					d = Math.abs( touchDelta * 1.5 );

				this.removeEventListener( 'touchmove', touchMove, false );
				this.removeEventListener( 'touchend', touchEnd, false );
				touchStarted = false;

				reqAnimFrame( function touchFinish() {
					var dx;

					if ( t === d || touchStarted ) {
						return;
					}

					dx = easeOutExpo( touchDelta, d, t );

					if ( !isNaN( dx ) && dx !== 0 ) {
						t += 1;
						if ( touchAxis === 'y' ) {
							scrollVertical( pane, dx );
						} else {
							scrollHorizontal( pane, dx );
						}

						reqAnimFrame( touchFinish );
					}
				});
			};

		if ( event.touches.length === 1 ) {
			touchX0 = event.touches[0].clientX;
			touchY0 = event.touches[0].clientY;
			touchStarted = true;
			this.addEventListener( 'touchmove', touchMove, false );
			this.addEventListener( 'touchend', touchEnd, false );
			reqAnimFrame( touchPoll );
		}
	},

	api = {
		reposition: function() {
			return this.each(function() {
				var $this = $( this ),
					data = $this.data( 'enscroll' ),
					positionElem = function( elem, x, y ) {
						elem.style.left = x + 'px';
						elem.style.top = y + 'px';
					},
					corner, trackWrapper, offset;

				if ( data ) {
					offset = $this.position();
					corner = data.corner;
					if ( data.settings.verticalScrolling ) {
						trackWrapper = data.verticalTrackWrapper;
						positionElem( trackWrapper,
                            ( data.settings.verticalScrollerSide === 'right' ? offset.left + $this.outerWidth() - $( trackWrapper ).width() - getComputedValue( this, 'border-right-width' ) : offset.left + getComputedValue( this, 'border-left-width' )),
							offset.top + getComputedValue( this, 'border-top-width' ));
					}

					if ( data.settings.horizontalScrolling ) {
						trackWrapper = data.horizontalTrackWrapper;
						positionElem( trackWrapper,
							offset.left + getComputedValue( this, 'border-left-width' ),
							offset.top + $this.outerHeight() - $( trackWrapper ).height() - getComputedValue( this, 'border-bottom-width' ));
					}

					if ( corner ) {
						positionElem( corner,
							offset.left + $this.outerWidth() - $( corner ).outerWidth() - getComputedValue( this, 'border-right-width' ),
							offset.top + $this.outerHeight() - $( corner ).outerHeight() - getComputedValue( this, 'border-bottom-width' ));
					}
				}
			});
		},

		resize: function() {
			return this.each(function() {
				var $this = $( this ),
					data = $this.data( 'enscroll' ),
					settings, paneHeight, paneWidth,
					trackWrapper, pct, track, trackWidth, trackHeight,
					$scrollUpBtn, $scrollDownBtn, $scrollLeftBtn, $scrollRightBtn,
					handle, handleWidth, handleHeight, prybar;

				if ( !data ) {
					return true;
				}

				settings = data.settings;

				if ( $this.is( ':visible' )) {
					if ( settings.verticalScrolling ) {
						trackWrapper = data.verticalTrackWrapper;
						paneHeight = $this.innerHeight();
						pct = paneHeight / this.scrollHeight;
						track = $( trackWrapper ).find( '.enscroll-track' )[0];
						$scrollUpBtn = $( trackWrapper ).find( '.' + settings.scrollUpButtonClass );
						$scrollDownBtn = $(trackWrapper).find( '.' + settings.scrollDownButtonClass );

						trackHeight = settings.horizontalScrolling ?
							paneHeight - $( data.horizontalTrackWrapper ).find( '.enscroll-track' ).outerHeight() :
							paneHeight;
						trackHeight -= $( track ).outerHeight() - $( track ).height() + $scrollUpBtn.outerHeight() + $scrollDownBtn.outerHeight();

						handle = track.firstChild;
						handleHeight = Math.max( pct * trackHeight,
							settings.minScrollbarLength );
						handleHeight -= $( handle ).outerHeight() - $( handle ).height();

						// hide the track first -- this causes less reflows and
						// fixes an IE8 bug that prevents background images
						// from being redrawn
						trackWrapper.style.display = 'none';
						track.style.height = trackHeight + 'px';
						handle.style.height = handleHeight + 'px';
						if ( pct < 1 ) {
							pct = $this.scrollTop() / ( this.scrollHeight - $this.height() );
							handle.style.top = ( pct * ( trackHeight - handleHeight ) ) + 'px';
							trackWrapper.style.display = 'block';
						}
					}

					if ( settings.horizontalScrolling ) {
						trackWrapper = data.horizontalTrackWrapper;
						paneWidth = $this.innerWidth();
						pct = paneWidth / this.scrollWidth;
						track = $( trackWrapper ).find( '.enscroll-track' )[0];
						$scrollLeftBtn = $( trackWrapper ).find( '.' + settings.scrollLeftButtonClass );
						$scrollRightBtn = $( trackWrapper ).find( '.' + settings.scrollRightButtonClass );

						trackWidth = settings.verticalScrolling ?
							paneWidth - $( data.verticalTrackWrapper ).find( '.enscroll-track' ).outerWidth() :
							paneWidth;
						trackWidth -= $( track ).outerWidth() - $( track ).width() + $scrollLeftBtn.outerWidth() + $scrollRightBtn.outerWidth();

						handle = track.firstChild;
						handleWidth = Math.max( pct * trackWidth,
							settings.minScrollbarLength);
						handleWidth -= $( handle ).outerWidth() - $( handle ).width();

						// see comment above
						trackWrapper.style.display = 'none';
						track.style.width = trackWidth + 'px';
						handle.style.width = handleWidth + 'px';
						if ( pct < 1 ) {
							pct = $this.scrollLeft() / ( this.scrollWidth - $this.width() );
							handle.style.left = ( pct * ( trackWidth - handleWidth ) ) + 'px';
							trackWrapper.style.display = 'block';
						}

						if ( data._prybar ) {
							prybar = data._prybar;
							this.removeChild( prybar );
							if ( settings.verticalScrolling ) {
								prybar.style.width = ( this.scrollWidth + $( data.verticalTrackWrapper ).find( '.enscroll-track' ).outerWidth()) + 'px';
								this.appendChild( prybar );
							}
						}
					}
					if ( data.corner ) {
						data.corner.style.display = data.verticalTrackWrapper && data.horizontalTrackWrapper && $( data.verticalTrackWrapper ).is( ':visible' ) && $( data.horizontalTrackWrapper ).is( ':visible' ) ? '' : 'none';
					}
				} else {
					if ( settings.verticalScrolling ) {
						data.verticalTrackWrapper.style.display = 'none';
					}
					if ( settings.horizontalScrolling ) {
						data.horizontalTrackWrapper.style.display = 'none';
					}
					if ( data.corner ) {
						data.corner.style.display = 'none';
					}
				}

			});
		},

		startPolling: function() {
			return this.each(function() {
				var data = $( this ).data( 'enscroll' ),
					pane = this,
					$pane = $( pane ),
					paneWidth = -1,
					paneHeight = -1,
					paneScrollWidth = -1,
					paneScrollHeight = -1,
					paneOffset,

					paneChangeListener = function() {
						if ( data.settings.pollChanges ) {
							var sw = pane.scrollWidth,
								sh = pane.scrollHeight,
								pw = $pane.width(),
								ph = $pane.height(),
								offset = $pane.offset();

							if ( data.settings.verticalScrolling &&
									( ph !== paneHeight || sh !== paneScrollHeight ) ||
								data.settings.horizontalScrolling &&
									( pw !== paneWidth || sw !== paneScrollWidth ) ) {
								paneScrollWidth = sw;
								paneScrollHeight = sh;

								api.resize.call( $pane );
							}

							if ( paneOffset.left !== offset.left ||
									paneOffset.top !== offset.top ||
									pw !== paneWidth ||
									ph !== paneHeight ) {

								paneOffset = offset;
								paneWidth = pw;
								paneHeight = ph;

								api.reposition.call( $pane );
							}

							setTimeout( paneChangeListener, 350 );
						}
					};

				if ( data ) {
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
				var data = $( this ).data( 'enscroll' );
				if ( data ) {
					data.settings.pollChanges = false;
				}
			});
		},

		destroy: function() {
			return this.each(function() {
				var $this = $( this ),
					data = $this.data( 'enscroll' ),
					trackWrapper, mouseScrollHandler;
				if ( data ) {

					api.stopPolling.call( $this );

					mouseScrollHandler = data._mouseScrollHandler;

					if ( data.settings.verticalScrolling ) {
						trackWrapper = data.verticalTrackWrapper;

						$( trackWrapper ).remove();
						trackWrapper = null;
					}

					if ( data.settings.horizontalScrolling ) {
						trackWrapper = data.horizontalTrackWrapper;

						$( trackWrapper ).remove();
						trackWrapper = null;
					}

					// clear the fade timer to prevent an error being thrown
					// when the plugin object is destroyed while the fading
					// scrollbar is visible - shoutout to gpurves
					if ( data._fadeTimer ) {
						clearTimeout( data._fadeTimer );
					}

					if ( data.corner ) {
						$( data.corner ).remove();
					}

					if ( data._prybar && data._prybar.parentNode && data._prybar.parentNode === this ) {
						$( data._prybar ).remove();
					}

					this.setAttribute( 'style', data._style || '' );

					if ( !data._hadTabIndex ) {
						$this.removeAttr( 'tabindex' );
					}

					$this
						.off( 'scroll.enscroll.pane' )
						.off( 'keydown.enscroll.pane' )
						.off( 'mouseenter.enscroll.pane' )
						.off( 'mousedown.enscroll.pane' )
						.data( 'enscroll', null );

					if ( this.removeEventListener ) {
						this.removeEventListener( 'wheel', mouseScrollHandler, false );
						this.removeEventListener( 'mousewheel', mouseScrollHandler, false );
						this.removeEventListener( 'touchstart', touchStart, false );
					} else if ( this.detachEvent ) {
						this.detachEvent( 'onmousewheel', mouseScrollHandler );
					}

					$( win ).off( 'resize.enscroll.window' );
				}
			});
		}
	};


	$.fn.enscroll = function( opts ) {

		var settings;
		// handle API method calls
		if ( api[opts] ) {
			return api[opts].call( this );
		}
		// otherwise, initialize the enscroll element

		// use default settings, and overwrite defaults with options passed in
		settings = $.extend( {}, defaultSettings, opts );

		return this.each( function() {

			// don't apply this plugin when both scrolling settings are false
			if ( !settings.verticalScrolling && !settings.horizontalScrolling ) {
				return;
			}

			var $this = $( this ),
				pane = this,
				oldStyle = $this.attr( 'style' ),
				hadTabIndex = true,
				horizontalTrackWrapper, verticalTrackWrapper,
				horizontalTrack, verticalTrack,
				horizontalHandle, verticalHandle,
				verticalUpButton, verticalDownButton,
				horizontalLeftButton, horizontalRightButton,
				trackHeight, trackWidth,
				corner, outline, tabindex,
				outlineWidth, prybar, paddingSide,
				trackWrapperCSS = {
					'position': 'absolute',
					'z-index': settings.zIndex,
					'margin': 0,
					'padding': 0
				},

				// closures to bind events to handlers
				mouseScrollHandler = function( event ) {
					mouseScroll.call( pane, event );
				},
				addHandleHTML = function( handle, html ) {
					if ( typeof html === 'string' ) {
						$( handle ).html( html );
					} else {
						handle.appendChild( html );
					}
				};

			// if we want vertical scrolling, create and initialize
			// the horizontal scrollbar and its components
			if ( settings.verticalScrolling ) {
				verticalTrackWrapper = doc.createElement( 'div' );
				verticalTrack = doc.createElement( 'div' );
				verticalHandle = doc.createElement( 'a' );

				$( verticalTrack )
					.css( 'position', 'relative' )
					.addClass( 'enscroll-track' )
					.addClass( settings.verticalTrackClass )
					.appendTo( verticalTrackWrapper );

				if ( settings.drawScrollButtons ) {
					verticalUpButton = doc.createElement( 'a' );
					verticalDownButton = doc.createElement( 'a' );

					$( verticalUpButton )
						.css({
							'display': 'block',
							'text-decoration': 'none'
						})
						.attr( 'href', '' )
						.html( '&nbsp;' )
						.addClass( settings.scrollUpButtonClass )
						.on( 'click', function() {
							scrollVertical( pane, -settings.scrollIncrement );
							return false;
						})
						.insertBefore( verticalTrack );

					$( verticalDownButton )
						.css({
							'display': 'block',
							'text-decoration': 'none'
						})
						.attr( 'href', '' )
						.html( '&nbsp;' )
						.on( 'click', function() {
							scrollVertical( pane, settings.scrollIncrement );
							return false;
						})
						.addClass( settings.scrollDownButtonClass )
						.appendTo( verticalTrackWrapper );
				}

				if ( settings.clickTrackToScroll ) {
					$( verticalTrack ).on( 'click', function( event ) {
						if ( event.target === this ) {
							scrollAnimateVertical( $this,
								event.pageY > $( verticalHandle ).offset().top ? $this.height() :
								-$this.height() );
						}
					});
				}

				$( verticalHandle )
					.css({
						'position': 'absolute',
						'z-index': 1
					})
					.attr( 'href', '' )
					.addClass( settings.verticalHandleClass )
					.mousedown( { pane: this }, startVerticalDrag )
					.click( function() { return false; })
					.appendTo( verticalTrack );

				addHandleHTML( verticalHandle, settings.verticalHandleHTML );

				$( verticalTrackWrapper )
					.css( trackWrapperCSS )
					.insertAfter( this );

				if ( settings.showOnHover ) {
					$( verticalTrackWrapper )
						.css( 'opacity', 0 )
						.on( 'mouseover.enscroll.vertical', function() {
							showScrollbars.call( pane, false );
						})
						.on( 'mouseout.enscroll.vertical', function() {
							showScrollbars.call( pane );
						});
				}

				trackWidth = $( verticalTrack ).outerWidth();

				// move the content in the pane over to make room for
				// the vertical scrollbar
				if ( settings.addPaddingToPane ) {
					if ( settings.verticalScrollerSide === 'right' ) {
						paddingSide = {
							'padding-right': ( getComputedValue( this, 'padding-right' ) + trackWidth ) + 'px'
						};
					} else {
						paddingSide = {
							'padding-left': ( getComputedValue( this, 'padding-left' ) + trackWidth ) + 'px'
						};
					}

					$this.css($.extend({
						'width': ( $this.width() - trackWidth ) + 'px'
					}, paddingSide));
				}

				try {

					outlineWidth = parseInt( $this.css( 'outline-width' ), 10 );

					if (( outlineWidth === 0 || isNaN( outlineWidth )) &&
						$this.css( 'outline-style') === 'none' ) {
						$this.css( 'outline', 'none' );
					}
				} catch( ex ) {
					$this.css( 'outline', 'none' );
				}
			}

			// if we want horizontal scrolling, create the elements for and
			// initialize the horizontal track and handle
			if ( settings.horizontalScrolling ) {
				horizontalTrackWrapper = doc.createElement( 'div' );
				horizontalTrack = doc.createElement( 'div' );
				horizontalHandle = doc.createElement( 'a' );

				$( horizontalTrack )
					.css({
						'position': 'relative',
						'z-index': 1
					})
					.addClass( 'enscroll-track' )
					.addClass( settings.horizontalTrackClass )
					.appendTo( horizontalTrackWrapper );

				if ( settings.drawScrollButtons ) {
					horizontalLeftButton = doc.createElement( 'a' );
					horizontalRightButton = doc.createElement( 'a' );

					$( horizontalLeftButton )
						.css( 'display', 'block' )
						.attr( 'href', '' )
						.on( 'click', function() {
							scrollHorizontal( pane, -settings.scrollIncrement );
							return false;
						})
						.addClass( settings.scrollLeftButtonClass )
						.insertBefore( horizontalTrack );

					$( horizontalRightButton )
						.css( 'display', 'block' )
						.attr( 'href', '' )
						.on( 'click', function() {
							scrollHorizontal( pane, settings.scrollIncrement );
							return false;
						})
						.addClass( settings.scrollRightButtonClass )
						.appendTo( horizontalTrackWrapper );
				}

				if ( settings.clickTrackToScroll ) {
					$( horizontalTrack).on( 'click', function( event ) {
						if ( event.target === this ) {
							scrollAnimateHorizontal( $this,
								event.pageX > $(horizontalHandle).offset().left ? $this.width() :
								-$this.width() );
						}
					});
				}

				$( horizontalHandle )
					.css({
						'position': 'absolute',
						'z-index': 1
					})
					.attr( 'href', '' )
					.addClass( settings.horizontalHandleClass )
					.click( function() { return false; })
					.mousedown( { pane: this }, startHorizontalDrag )
					.appendTo( horizontalTrack );

				addHandleHTML( horizontalHandle, settings.horizontalHandleHTML );

				$( horizontalTrackWrapper )
					.css( trackWrapperCSS )
					.insertAfter( this );

				if ( settings.showOnHover ) {
					$( horizontalTrackWrapper )
						.css( 'opacity', 0 )
						.on( 'mouseover.enscroll.horizontal', function() {
							showScrollbars.call( pane, false );
						})
						.on( 'mouseout.enscroll.horizontal', function() {
							showScrollbars.call( pane );
						});
				}

				trackHeight = $( horizontalTrack ).outerHeight();

				if ( settings.addPaddingToPane ) {
					$this.css({
						'height': ( $this.height() - trackHeight ) + 'px',
						'padding-bottom': ( parseInt( $this.css( 'padding-bottom' ), 10 ) + trackHeight ) + 'px'
					});
				}

				// we need to add an element to the pane in order to
				// stretch to the scrollWidth of the pane so the content
				// scrolls horizontally beyond the vertical scrollbar
				if ( settings.verticalScrolling ) {
					prybar = document.createElement( 'div' );
					$( prybar )
						.css({
							'width': '1px',
							'height': '1px',
							'visibility': 'hidden',
							'padding': 0,
							'margin': '-1px'
						})
						.appendTo( this );
				}
			}

			if ( settings.verticalScrolling && settings.horizontalScrolling && settings.drawCorner ) {
				corner = doc.createElement( 'div' );
				$( corner )
					.addClass( settings.cornerClass )
					.css( trackWrapperCSS )
					.insertAfter( this );
			}

			// add a tabindex attribute to the pane if it doesn't already have one
			// if the element does not have a tabindex in IE6, undefined is returned,
			// all other browsers return an empty string
			tabindex = $this.attr( 'tabindex' );
			if ( !tabindex ) {
				$this.attr( 'tabindex', 0 );
				hadTabIndex = false;
			}

			// if the outline style is not specified in IE6/7/8, null is returned
			// all other browsers return an empty string
			try {
				outline = $this.css( 'outline' );
				if ( !outline || outline.length < 1 ) {
					$this.css( 'outline', 'none' );
				}
			} catch(ex) {
				$this.css( 'outline', 'none' );
			}

			// register an handler that listens for the pane to scroll, and
			// sync the scrollbars' positions
			$this
				.on({
					'scroll.enscroll.pane': function( event ) {
						paneScrolled.call( this, event );
					},
					'keydown.enscroll.pane': keyHandler,
					'mousedown.enscroll.pane': dragHandler
				})
				.css( 'overflow', 'hidden' )
				// store the data we need for handling events and destruction
				.data( 'enscroll', {
					settings: settings,
					horizontalTrackWrapper: horizontalTrackWrapper,
					verticalTrackWrapper: verticalTrackWrapper,
					corner: corner,
					_prybar: prybar,
					_mouseScrollHandler: mouseScrollHandler,
					_hadTabIndex: hadTabIndex,
					_style: oldStyle,
					_scrollingX: false,
					_scrollingY: false,
					_startX: 0,
					_startY: 0,
					_endX: 0,
					_endY: 0,
					_duration: parseInt( settings.easingDuration / 16.66666, 10 ),
					_scrollHeightNoPadding: testScrollHeight( this.nodeName )
				});

			// reposition the scrollbars if the window is resized
			$( win ).on( 'resize.enscroll.window', function() {
				api.reposition.call( $this );
			});

			// if showOnHover is set, attach the hover listeners
			if ( settings.showOnHover ) {
				$this.on( 'mouseenter.enscroll.pane', function() {
					showScrollbars.call( this );
				});
			}

			// listen for mouse wheel and touch events and scroll appropriately
			if ( this.addEventListener ) {
				if ( 'onwheel' in this || 'WheelEvent' in win &&
					navigator.userAgent.toLowerCase().indexOf( 'msie' ) >= 0 ) {
					this.addEventListener( 'wheel', mouseScrollHandler, false );
				} else if ( 'onmousewheel' in this ) {
					this.addEventListener( 'mousewheel', mouseScrollHandler, false );
				}

				this.addEventListener( 'touchstart', touchStart, false );
			} else if ( this.attachEvent ) {
				// oldie love
				this.attachEvent( 'onmousewheel', mouseScrollHandler );
			}

			// start polling for changes in dimension and position
			if ( settings.pollChanges ) {
				api.startPolling.call( $this );
			}

			api.resize.call( $this );
			api.reposition.call( $this );

		});

	};

}( jQuery, window, document ));
