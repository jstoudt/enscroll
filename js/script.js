var enscroll = {
	loaded: false,
	fiddleLoaded: false,
	featuresLoaded: false,
	mode: 0
};

enscroll.docTableOrList = null; // will be either 'table' or 'list'
enscroll.docData = { 'options': [{
		'property': 'verticalScrolling',
		'value': 'true',
		'description': 'Whether to render the scrollbars on the right to scroll vertically when the content of the view pane has a height greater than the height of the view pane itself'
	}, {
		'property': 'horizontalScrolling',
		'value': 'false',
		'description': 'Whether to render the scrollbars on the bottom to scroll horizontally when the content of the view pane has a width greater than the width of the view pane itself'
	}, {
		'property': 'showOnHover',
		'value': 'false',
		'description': 'When enabled, the scrollbar(s) will remain hidden until the user hovers the mouse cursor over the view pane. This feature is useful when creating a scrolling UI similar to Facebook’s ticker on the News Feed'
	}, {
		'property': 'scrollIncrement',
		'value': '40',
		'description': 'The distance(in pixels) the view pane should scroll when using the mousewheel or arrow keys on the keyboard'
	}, {
		'property': 'minScrollbarLength',
		'value': '25',
		'description': 'The length of the scrollbar handles will vary in length according to the size of the content in the view pane. This property specifies a minimum length(in pixels) beyond which the scrollbar will not contract'
	}, {
		'property': 'pollChanges',
		'value': 'true',
		'description': 'Whether to listen for changes to the view pane including content being changed within the view pane, changes to the width and height of the view pane, and changes to the position of the view pane. If one of these changes is detected, the scrollbar(s) will be updated to reflect these new properties'
	}, {
		'property': 'drawCorner',
		'value': 'true',
		'description': 'Whether to render a corner element at the bottom right of the view pane when both vertical and horizontal scrollbars are visible'
	}, {
		'property': 'verticalTrackClass',
		'value': '\'vertical-track\'',
		'description': 'The CSS class name given to the track of the vertical scrollbar'
	}, {
		'property': 'horizontalTrackClass',
		'value': '\'horizontal-track\'',
		'description': 'The CSS class name given to the track of the horizontal scrollbar'
	}, {
		'property': 'verticalHandleClass',
		'value': '\'vertical-handle\'',
		'description': 'The CSS class name given to the handle of the vertical scrollbar'
	}, {
		'property': 'horizontalHandleClass',
		'value': '\'horizontal-handle\'',
		'description': 'The CSS class name given to the handle of the horizontal scrollbar'
	}, {
		'property': 'cornerClass',
		'value': '\'scrollbar-corner\'',
		'description': 'The CSS class name given to the corner element'
	}]
};
enscroll.renderDocTable = function(data) {
	Handlebars.registerPartial('row', '<td class="property">{{property}}</td><td class="value">{{value}}</td><td class="description">{{description}}</td>');
	var source = '<table><thead><tr><th class="property">Property</th><th class="value">Default Value</th><th class="description">Description</th></tr></thead><tbody>{{#options}}<tr>{{> row}}</tr>{{/options}}</tbody></table>',
		template = Handlebars.compile(source);
	return template(enscroll.docData);

};
enscroll.renderDocList = function(data) {
	Handlebars.registerPartial('item', '<dt class="property">Property</dt><dd class="property">{{property}}</dd><dt class="value">Default Value</dt><dd class="value">{{value}}</dd><dt class="description">Description</dt><dd class="description">{{description}}</dd>');
	var source = '<ul>{{#options}}<li>{{> item}}</li>{{/options}}</ul>',
		template = Handlebars.compile(source);
	return template(enscroll.docData);
};

enscroll.changeTab = function() {
	var hash = location.hash.toLowerCase(),
		i = 0,
		arr = ['#', '!', '/'],
		init = function(tab) {
			var url, iframe;

			$('.folder-content').css('min-height', $('.folder-content').find('section:visible').height());

			if (tab === 'try-it-now') {
				enscroll.fiddleLoaded = enscroll.fiddleLoaded || (function() {
					url = 'http://jsfiddle.net/jstoudt/PGuB5/';
					iframe = $('#try-it-now iframe').get(0);
					if (!iframe.src || iframe.src !== url) {
						iframe.src = url;
					}
				})();
			} else if (tab === 'demos') {
				enscroll.loadDemos();
			} else if (tab === 'features') {
				if (!enscroll.featuresLoaded && typeof DD_belatedPNG !== 'undefined') {
					DD_belatedPNG.fix('.feature-list li');
					enscroll.featuresLoaded = true;
				}
			}
			
		};
	
	for (; i < arr.length; i++) {
		if (hash.charAt(0) === arr[i]) {
			hash = hash.substring(1);
		}
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

	location.hash = '#!/' + hash;

	$('.folder-tabs').find('a').removeClass('selected');
	$('.folder-tabs').find('[rel="' + hash + '"]').addClass('selected');

	if (enscroll.loaded) {
		$('.folder-content').find('section:visible').stop().fadeOut('normal', function() {
			$('#' + hash).stop().fadeIn('normal', function() {
				init(hash);
			});
		});
	} else {
		$('.folder-content').find('section').css('display', 'none');
		document.getElementById(hash).style.display = 'block';
		init(hash);
		enscroll.loaded = true;
	}

};

enscroll.loadDemos = function() {
	var destroy = function($elem) {
			if ($elem.css('overflow') === 'hidden') {
				$elem.enscroll('destroy');
			}
		},
		$scrollpane = $('#scrollpane1');

	destroy($scrollpane);
	$scrollpane.enscroll({
		verticalTrackClass: 'track1',
		verticalHandleClass: 'handle1'
	});

	$scrollpane = $('#scrollpane2');
	destroy($scrollpane);
	$scrollpane.enscroll({
		horizontalScrolling: true,
		verticalTrackClass: 'track2-vertical',
		verticalHandleClass: 'handle2-vertical',
		horizontalTrackClass: 'track2-horizontal',
		horizontalHandleClass: 'handle2-horizontal',
		cornerClass: 'corner2'
	});

	$scrollpane = $('#scrollpane3');
	destroy($scrollpane);
	$scrollpane.enscroll({
		showOnHover: true,
		verticalTrackClass: 'track3',
		verticalHandleClass: 'handle3'
	});

	$scrollpane = $('#scrollpane4');
	destroy($scrollpane);
	$scrollpane.enscroll({
		verticalTrackClass: 'track4',
		verticalHandleClass: 'handle4',
		minScrollbarLength: 75
	});
};

enscroll.resize = function() {
	
	var width = document.compatMode === 'CSS1Compat' && document.clientWidth ? document.clientWidth :
		document.body.clientWidth,
		result;

	if (width <= 480) {
		if (enscroll.mode !== 1) {
			enscroll.loadDemos();
			document.getElementById('doc-content').innerHTML = enscroll.renderDocList();
			$('#overview, #features, #documentation, #demos').css('display', 'block');
			$('#try-it-now').css('display', 'none');
			enscroll.mode = 1;
		}
	} else if (width <= 768) {
		if (enscroll.mode !== 2) {
			enscroll.loadDemos();
			document.getElementById('doc-content').innerHTML = enscroll.renderDocList();
			$('#overview, #features, #documentation, #demos').css('display', 'block');
			$('#try-it-now').css('display', 'none');
			enscroll.mode = 2;
		}
	} else {
		if (enscroll.mode !== 3) {
			enscroll.loadDemos();
			document.getElementById('doc-content').innerHTML = enscroll.renderDocTable();
			enscroll.changeTab();
			enscroll.mode = 3;
		}
	}

};

$(function() {

	var oldHash = null;

	if (Modernizr.hashchange) {
		if (window.addEventListener) {
			window.addEventListener('hashchange', enscroll.changeTab, false);
		} else if (window.attachEvent) {
			window.attachEvent('onhashchange', enscroll.changeTab);
		} else {
			window.onhashchange = enscroll.changeTab;
		}
		if ($('.folder-tabs').is(':visible')) {
			enscroll.changeTab();
		}
	} else {
		(function pollHash() {
			var hash = location.hash.toLowerCase();
			if (!oldHash || oldHash !== hash) {
				enscroll.changeTab();
				oldHash = hash;
			}
			setTimeout(pollHash, 350);
		})();
	}

	$(window).resize(enscroll.resize);
	enscroll.resize();

	$('#demo-btn').click(function() {
		this.scrollIntoView(true);
	});
	
	$('#scroll-to-top').click(function() {
		document.getElementsByTagName('header')[0].scrollIntoView(true);
		return false;
	});

	$('.view-code').overlay({
		effect: 'apple',
		mask: {
			color: '#000',
			opacity: 0.85
		},
		onLoad: function(event) {
			var iframe = $(event.target.rel).find('iframe').get(0);
			if (iframe && !iframe.src) {
				iframe.src = event.target.href;
			}
		}
	});

});











// Script necessary for the Facebook Like Button
(function(d, s, id) {
		var js,
			fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {
			return;
		}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
		fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

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

// Script needed for the Google +1 button
(function() {
	var po = document.createElement('script');
	po.type = 'text/javascript';
	po.async = true;
	po.src = 'https://apis.google.com/js/plusone.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(po, s);
})();