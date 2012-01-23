$(function() {

	var oldHash = '',
		loaded = false,
		changeTab = function() {
			var hash = location.hash.toLowerCase(),
				i = 0,
				arr = ['#', '!', '/'],
				loadFiddle = function() {
					var url = 'http://jsfiddle.net/jstoudt/PGuB5/',
						iframe = $('#try-it-now iframe').get(0);
					if (iframe.src || iframe.src !== url) {
						iframe.src = url;
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

			if (loaded) {
				$('.folder-content').find('section:visible').stop().fadeOut('normal', function() {
					$('#' + hash).stop().fadeIn('normal', function() {
						if (hash === 'try-it-now') {
							loadFiddle();
						}
					});
				});
			} else {
				$('.folder-content').find('section').css('display', 'none');
				document.getElementById(hash).style.display = 'block';
				if (hash === 'try-it-now') {
					loadFiddle();
				}
				loaded = true;
			}
		
		};

	if (Modernizr.hashchange) {
		if (window.addEventListener) {
			window.addEventListener('hashchange', changeTab, false);
		} else if (window.attachEvent) {
			window.attachEvent('onhashchange', changeTab);
		} else {
			window.onhashchange = changeTab;
		}
		changeTab();
	} else {
		(function pollHash() {
			var hash = location.hash.toLowerCase();
			if (oldHash !== hash) {
				changeTab();
				oldHash = hash;
			}
			setTimeout(pollHash, 350);
		})();
	}
	
	$('#scroll-to-top').click(function() {
		scrollTo(0, 0);
		return false;
	});

});

// Script necessary for the Facebook Like Button
(function(d, s, id) {
		var js,
			fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
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