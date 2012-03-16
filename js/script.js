var enscroll = {
	loaded: false,
	fiddleLoaded: false,
	featuresLoaded: false,
	width: -1,
	docData: [
		{
			property: 'verticalScrolling',
			value: 'true',
			description: 'Whether to render the scrollbars on the right to scroll vertically when the content of the view pane has a height greater than the height of the view pane itself'
		}, {
			property: 'horizontalScrolling',
			value: 'false',
			description: 'Whether to render the scrollbars on the bottom to scroll horizontally when the content of the view pane has a width greater than the width of the view pane itself'
		}, {
			property: 'showOnHover',
			value: 'false',
			description: 'When enabled, the scrollbar(s) will remain hidden until the user hovers the mouse cursor over the view pane. This feature is useful when creating a scrolling UI similar to Facebook’s ticker on the News Feed'
		}, {
			property: 'scrollIncrement',
			value: '40',
			description: 'The distance(in pixels) the view pane should scroll when using the mousewheel or arrow keys on the keyboard'
		}, {
			property: 'minScrollbarLength',
			value: '25',
			description: 'The length of the scrollbar handles will vary in length according to the size of the content in the view pane. This property specifies a minimum length(in pixels) beyond which the scrollbar will not contract'
		}, {
			property: 'pollChanges',
			value: 'true',
			description: 'Whether to listen for changes to the view pane including content being changed within the view pane, changes to the width and height of the view pane, and changes to the position of the view pane. If one of these changes is detected, the scrollbar(s) will be updated to reflect these new properties'
		}, {
			property: 'drawCorner',
			value: 'true',
			description: 'Whether to render a corner element at the bottom right of the view pane when both vertical and horizontal scrollbars are visible'
		}, {
			property: 'drawScrollButtons',
			value: 'false',
			description: 'Whether to render up and down scroll buttons above and below the vertical scrollbar.  If the horizontal scrolling is enabled, left and right scroll buttons will be rendered to the left and right of the horizontal scrollbar'
		}, {
			property: 'clickTrackToScroll',
			value: 'true',
			description: 'If set to true, the view pane will scroll up a page when you click the track above the handle, and scroll down a page when you click the track below the handle'
		}, {
			property: 'verticalTrackClass',
			value: "'vertical-track'",
			description: 'The CSS class name given to the track of the vertical scrollbar'
		}, {
			property: 'horizontalTrackClass',
			value: "'horizontal-track'",
			description: 'The CSS class name given to the track of the horizontal scrollbar'
		}, {
			property: 'verticalHandleClass',
			value: "'vertical-handle'",
			description: 'The CSS class name given to the handle of the vertical scrollbar'
		}, {
			property: 'horizontalHandleClass',
			value: "'horizontal-handle'",
			description: 'The CSS class name given to the handle of the horizontal scrollbar'
		}, {
			property: 'cornerClass',
			value: "'scrollbar-corner'",
			description: 'The CSS class name given to the corner element'
		}, {
			property: 'scrollUpButtonClass',
			value: "'scroll-up-btn'",
			description: 'The CSS class name given to the scroll up button above the vertical scrollbar track'
		}, {
			property: 'scrollDownButtonClass',
			value: "'scroll-down-btn'",
			description: 'The CSS class name given to the scroll down button below the vertical scrollbar track'
		}, {
			property: 'scrollLeftButtonClass',
			value: "'scroll-left-btn'",
			description: 'The CSS class name given to the scroll left button to the left of the horizontal scrollbar track'
		}, {
			property: 'scrollRightButtonClass',
			value: "'scroll-right-btn'",
			description: 'The CSS class name given to the scroll right button to the right of the horizontal scrollbar track'
		}
	],

	renderDocs: function() {
		$('#doc-content').find('script[type="text/x-handlebars-template"]').each(function() {
			var $elem = $(this),
				template = Handlebars.compile($elem.html());

			$elem.parent().html(template(enscroll.docData));
		});
	},

	changeTab: function() {
		var hash = location.hash.toLowerCase(),
			section = null,
			init = function() {
				var url, iframe;

				$('.folder-content').css('min-height', $('.folder-content').find('section:visible').height());

				if ( hash === 'try-it-now' ) {
					enscroll.fiddleLoaded = enscroll.fiddleLoaded || (function() {
						url = 'http://jsfiddle.net/jstoudt/PGuB5/';
						iframe = $( '#try-it-now-section' ).find( 'iframe' ).get( 0 );
						if ( !iframe.src || iframe.src !== url ) {
							iframe.src = url;
						}
						return true;
					})();
				}

				if ( hash === 'demos' ) {
					enscroll.loadDemos();
				}

				if ( hash === 'features' ) {
					if (!enscroll.featuresLoaded && typeof DD_belatedPNG !== 'undefined') {
						DD_belatedPNG.fix('.feature-list li');
						enscroll.featuresLoaded = true;
					}
				}
				
			};
		
		if ( hash.charAt(0) === '#' ) {
			hash = hash.substring( 1 );
		}

		switch(hash) {
			case 'features':
			case 'documentation':
			case 'demos':
			case 'try-it-now':
				break;
			default:
				hash = 'overview';
		}

		$( '.folder-tabs' ).find('a').removeClass( 'selected' );
		$( '.folder-tabs' ).find('[rel="' + hash + '"]').addClass( 'selected' );

		if (enscroll.loaded) {
			$('.folder-content').find('section:visible').stop().fadeOut('fast', function() {
				$('#' + hash + '-section').stop().fadeIn('fast', function() {
					init();
				});
			});
		} else {
			$('.folder-content').find('section').css('display', 'none');

			section = document.getElementById(hash + '-section');
			if (section) {
				section.style.display = 'block';
			}
			init();
			enscroll.loaded = true;
		}

	},

	loadDemos: function() {
		$('.scrollpane').enscroll('destroy');

		$('#scrollpane1').enscroll({
			verticalTrackClass: 'track1',
			verticalHandleClass: 'handle1',
			drawScrollButtons: true,
			scrollUpButtonClass: 'scroll-up1',
			scrollDownButtonClass: 'scroll-down1'
		});

		$('#scrollpane2').enscroll({
			horizontalScrolling: true,
			verticalTrackClass: 'track2-vertical',
			verticalHandleClass: 'handle2-vertical',
			horizontalTrackClass: 'track2-horizontal',
			horizontalHandleClass: 'handle2-horizontal',
			cornerClass: 'corner2'
		});

		$('#scrollpane3').enscroll({
			showOnHover: true,
			clickTrackToScroll: false,
			verticalTrackClass: 'track3',
			verticalHandleClass: 'handle3'
		});

		$('#scrollpane4').enscroll({
			clickTrackToScroll: false,
			verticalTrackClass: 'track4',
			verticalHandleClass: 'handle4',
			minScrollbarLength: 75
		});
	},

	resize: function() {
		var width = document.compatMode === 'CSS1Compat' && document.clientWidth ? document.clientWidth :
					document.body.clientWidth,
			toSmallSrc = function() {
				$('img[data-small-src]').each(function() {
					var $this = $(this),
						largeSrc = $this.attr('src');
					$this.attr({
						'src': $this.attr('data-small-src'),
						'data-large-src': largeSrc
					});
					$this.removeAttr('data-small-src');
				});
			},
			toLargeSrc = function() {
				$('img[data-large-src]').each(function() {
					var $this = $(this),
						smallSrc = $this.attr('src');
					$this.attr({
						'src': $this.attr('data-large-src'),
						'data-small-src': smallSrc
					});
					$this.removeAttr('data-large-src');
				});
			};
		
		/*
		// BEGIN DEBUG
		var debugElem = document.getElementById('debug-width') || (function() {
			var e = document.createElement('div'),
				css = {
					background: '#000',
					color: '#f00',
					position: 'fixed',
					'*position': 'absolute',
					right: '10px',
					'*left': '10px',
					top: '10px',
					width: '50px',
					height: '30px',
					font: 'bold 13px/30px monospace',
					padding: '0 10px',
					zIndex: 999,
					border: '1px solid #666',
					webkitBorderRadius: '4px',
					mozBorderRadius: '4px',
					borderRadius: '4px'
				};
			e.id = 'debug-width';

			for (var attr in css) {
				e.style[attr] = css[attr];
			}

			document.body.insertBefore(e, document.body.children[0]);
			return e;
		})();
		debugElem.innerHTML = width + 'px';
		// END DEBUG
		*/
		
		if (width < 768 && enscroll.width >= 768 ||
				width >= 768 && enscroll.width < 768 ||
				width < 480 && enscroll.width >= 480 ||
				width >= 480 && enscroll.width < 480 ||
				enscroll.width < 1) {
			
			enscroll.loadDemos();
			if (width >= 768) {
				enscroll.loaded = false;
				enscroll.changeTab();
				toLargeSrc();
			} else {
				$('#overview, #features, #documentation, #demos').css('display', 'block');
				$('#try-it-now').css('display', 'none');
				toSmallSrc();
			}
		}

		enscroll.width = width;
	}
};

$(function() {
	var oldHash = null,
		hasHashChange = Modernizr.hashchange;

	enscroll.renderDocs();

	if ( hasHashChange && window.addEventListener ) {
		window.addEventListener( 'hashchange', enscroll.changeTab, false );
	} else if ( hasHashChange && window.attachEvent ) {
		window.attachEvent( 'onhashchange', enscroll.changeTab );
	} else {
		(function pollHash() {
			var hash = location.hash.toLowerCase();
			if ( oldHash !== hash ) {
				enscroll.changeTab();
				oldHash = hash;
			}
			setTimeout(pollHash, 350);
		})();
	}

	$( window ).resize(enscroll.resize);
	if ( window.addEventListener ) {
		window.addEventListener( 'orientationchange', enscroll.resize, false );
	}
	enscroll.resize();

	$( '#scroll-to-top' ).click(function() {
		window.scroll( 0, 0 );
		return false;
	});

	$( 'a[data-tab-link]' ).click(function() {
		var that = this,
			delta = 10,
			cabinetY = Math.round( $( '.cabinet' ).offset().top ) - 20,
			reqAnimFrame = window.requestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(f) { setTimeout( f, 1000 / 60 ); };

		(function scrollWindow() {
			var curY = typeof window.pageYOffset === 'number' ? window.pageYOffset :
					document.documentElement ? document.documentElement.scrollTop :
					document.body.scrollTop;

			if ( curY === cabinetY ) {
				window.location = that.href;
			} else {
				delta = Math.min( ++delta, Math.abs( curY - cabinetY ) );
				window.scroll( 0, curY < cabinetY ? curY + delta : curY - delta );
				reqAnimFrame(scrollWindow);
			}
		})();

		return false;

	});

	$('.view-code').overlay({
		effect: 'apple',
		mask: {
			color: '#000',
			opacity: 0.85
		},
		onLoad: function(event) {
			var iframe = $( event.target.rel ).find( 'iframe' ).get( 0 );
			if ( iframe && !iframe.src ) {
				iframe.src = event.target.href;
			}
		}
	});

	if ($('.twitter-share-button').length) {
		// Script necessary for the tweet button
		!function(d,s,id){
			var js,
				fjs=d.getElementsByTagName(s)[0];
			if(!d.getElementById(id)) {
				js=d.createElement(s);
				js.id=id;
				js.src="//platform.twitter.com/widgets.js";
				fjs.parentNode.insertBefore(js,fjs);
			}
		}(document,"script","twitter-wjs");
	}

	if ($('.g-plusone').length) {
		// Script needed for the Google +1 button
		(function() {
			var po = document.createElement('script');
			po.type = 'text/javascript';
			po.async = true;
			po.src = 'https://apis.google.com/js/plusone.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(po, s);
		})();
	}

});