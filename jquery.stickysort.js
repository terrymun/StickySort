(function($){
	$.fn.stickySort = function(opts) {

		// Default settings
		var settings = $.extend(true, {
			threshold: {
				rows: 3,
				viewport: 0.25,
				px: false,
				allowanceEval: 'min'
			},
			sortable: false,
			scrollThrottle: 15,
			resizeThrottle: 250
		}, opts);

		this.each(function() {
			if($(this).is('table') && $(this).find('thead').length > 0 && $(this).find('th').length > 0) {
				// Clone <thead>
				var $w	   = $(window),
					$t	   = $(this),
					$thead = $t.find('thead').clone(),
					$col   = $t.find('thead, tbody').clone();

				// Add class, copy children classes, remove margins, reset width and wrap table
				$t
				.wrap('<div class="sticky-wrap" />')
				.parent()
					.addClass($t.attr('class'))
					.end()
				.addClass('sticky-enabled');

				if($t.hasClass('overflow-y')) $t.removeClass('overflow-y').parent().addClass('overflow-y');

				// Create new sticky table head (basic)
				$t.after('<div class="sticky-thead"><table /></div>');

				// If <tbody> contains <th>, then we create sticky column and intersect (advanced)
				if($t.find('tbody th').length > 0) {
					$t.after('<div class="sticky-col"><table /></div><div class="sticky-intersect"><table /></div>');
				}

				// Create shorthand for things
				var $stickyHead  = $(this).siblings('.sticky-thead'),
					$stickyCol   = $(this).siblings('.sticky-col'),
					$stickyInsct = $(this).siblings('.sticky-intersect'),
					$stickyWrap  = $(this).parent('.sticky-wrap');

				$stickyHead.find('table').append($thead);

				$stickyCol
				.find('table')
				.append($col)
					.find('thead th:gt(0)').remove()
					.end()
					.find('tbody td').remove();

				$stickyInsct.find('table').html('<thead><tr><th>'+$t.find('thead th:first-child').html()+'</th></tr></thead>');
				
				// Set widths
				var setWidths = function () {
						$t
						.find('thead th').each(function (i) {
							$stickyHead.find('th').eq(i).width($(this).width());
						})
						.end()
						.find('tr').each(function (i) {
							$stickyCol.find('tr').eq(i).height($(this).height());
						});

						// Set width of sticky table head
						$stickyHead
						.width($stickyWrap.width())
						.find('table')
							.width($t.width());

						// Set width of sticky table col
						$stickyCol.find('th').add($stickyInsct.find('th')).width($t.find('thead th').first().width());

						// Set position sticky intersect
						$stickyCol.find('table').css({
							left: $stickyWrap.offset().left
						});
					},
					repositionSticky = function () {
						// Return value of calculated allowance
						var allowance = calcAllowance();
					
						// 1. Deal with positioning of sticky header
						// Check if wrapper parent is overflowing along the y-axis
						if($t.height() > $stickyWrap.height()) {
							// If it is overflowing (advanced layout)
							// Position sticky header based on wrapper scrollTop()
							if($stickyWrap.scrollTop() > 0) {
								// When top of wrapping parent is out of view
								$stickyHead.add($stickyInsct).css({
									opacity: 1,
									'pointer-events': 'auto',
									position: 'fixed',
									top: $stickyWrap.offset().top - $w.scrollTop(),
									left: $stickyWrap.offset().left
								});
								$stickyHead.find('table').css({
									left: -$stickyWrap.scrollLeft()
								});
							} else {
								// When top of wrapping parent is in view
								$stickyHead.add($stickyInsct).css({
									opacity: 0,
									'pointer-events': 'none'
								});
								$stickyInsct.css({
									position: 'absolute',
									top: 0,
									left: 0
								});
							}
						} else {
							// If it is not overflowing (basic layout)
							// Position sticky header based on viewport scrollTop
							if($w.scrollTop() > $t.offset().top && $w.scrollTop() < $t.offset().top + $t.outerHeight() - allowance) {
								// When top of viewport is in the table itself
								$stickyHead.add($stickyInsct).css({
									opacity: 1,
									'pointer-events': 'auto',
									position: 'fixed',
									left: $stickyWrap.offset().left
								});
								$stickyHead.find('table').css({
									left: -$stickyWrap.scrollLeft()
								});
							} else {
								// When top of viewport is above or below table
								$stickyHead.add($stickyInsct).css({
									opacity: 0,
									'pointer-events': 'none',
									position: 'absolute',
									left: 0
								});
							}
						}

						// 2. Now deal with positioning of sticky column
						if($stickyWrap.scrollLeft() > 0) {
							// When left of wrapping parent is out of view
							$stickyCol.css({
								position: 'fixed',
								left: $stickyWrap.offset().left,
								top: $stickyWrap.offset().top - $w.scrollTop(),
								height: $stickyWrap.height()
							})
							.find('table')
								.css({
									top: -$stickyWrap.scrollTop(),
									left: 0
								})
							.end()
							.add($stickyInsct).css({
								opacity: 1,
								'pointer-events': 'auto'
							});
						} else {
							// When left of wrapping parent is in view
							$stickyCol
							.css({
								opacity: 0,
								'pointer-events': 'none'
							});
						}
					},
					calcAllowance = function () {
						var rowHeight = 0,
							allowance = [];

						// Calculate allowance
						$t.find('tbody tr:lt('+settings.threshold.rows+')').each(function () {
							rowHeight += $(this).height();
						});
						allowance.push(rowHeight);
						
						// Get height based on viewport
						allowance.push($w.height()*settings.threshold.viewport)
						
						// If pixel threshold exists, add it
						if(settings.threshold.px) {
							allowance.push(settings.threshold.px);
						}

						// Get minimum or maximum?
						if(settings.threshold.allowanceEval == 'min') {
							return Math.min.apply(null, allowance);
						} else {
							return Math.max.apply(null, allowance);
						}
					};

				setWidths();

				$t.parent('.sticky-wrap').scroll($.throttle(settings.scrollThrottle, repositionSticky));

				$w
				.load(setWidths)
				.resize($.debounce(settings.resizeThrottle, function () {
					setWidths();
					repositionSticky();
				}))
				.scroll($.throttle(settings.scrollThrottle, repositionSticky));

				// Extended feature: Sortable table
				// Do sorting only when original table is slated for sorting:
				// 1. Check if HTML5 data- attribute, data-sortable, exists
				// 2. Check if table has the class 'sortable'
				// 3. Check if settings.sortable is enabled
				if(settings.sortable || ($t.data('sortable') != undefined || $t.hasClass('sortable'))) {

					// Store original order of rows first, so we can return to its natural/resting state
					$t.find('tbody tr').each(function (i) {
						$(this).attr('data-sortOrder', i);
					});

					$stickyWrap
					.addClass('sortable')
					.find('thead th')
						.addClass('sort-default')
						.data('sortState', 1)
						.wrapInner('<div />')
						.find('div')
							.css({ position: 'relative' })
							.append('<a href="#" class="sort-handle"></a>')
							.find('.sort-handle')
								.click(function(e){ e.preventDefault(); });

					// Bind click function to all <thead>'s <th> elements in the original table AND all dynamically generated sticky tables
					$stickyWrap.on('click', '.sticky-enabled thead th, .sticky-thead thead th, .sticky-col thead th, .sticky-intersect thead th', function () {

						// Declare some variables
						var $th      = $(this),
							colIndex = $th.index(),
							$thSib   = $stickyWrap.find('thead th').eq(colIndex),
							$rows    = $.makeArray($t.find('tbody tr'));

						// Decide action - We have 3 states that we want to cater to:
						// 1. Original state (as how the data has been entered)
						// 2. Sorted state, ascending
						// 3. Sorted state, descending
						if($th.data('sortState')%3 == 0) {

							// Sort rows back to original order
							$rows.sort(function (a,b) {
								return parseInt($(a).attr('data-sortOrder')) - parseInt($(b).attr('data-sortOrder'));
							});

							$th.add($thSib).removeClass().addClass('sort-default');

						} else {
							// Sort rows
							// Algorithm adopted from http://my.opera.com/GreyWyvern/blog/show.dml/1671288
							$rows.sort(function (a, b) {

								var aa = chunkify($(a).children().eq(colIndex).text()),
									bb = chunkify($(b).children().eq(colIndex).text());

								function chunkify(t) {
									var tz = [], x = 0, y = -1, n = 0, i, j;

									while (i = (j = t.charAt(x++)).charCodeAt(0)) {
										var m = (i == 46 || (i >=48 && i <= 57));
										if (m !== n) {
											tz[++y] = "";
											n = m;
										}
										tz[y] += j;
									}
									return tz;
								}

								for (x = 0; aa[x] && bb[x]; x++) {
									if (aa[x] !== bb[x]) {
										var c = Number(aa[x]), d = Number(bb[x]);
										if (c == aa[x] && d == bb[x]) {
											return c - d;
										} else return (aa[x] > bb[x]) ? 1 : -1;
									}
								}

								return aa.length - bb.length;
							});

							// Reverse order on second click
							if($th.data('sortState')%3 == 2) {
								$rows = $rows.reverse();
								$th.add($thSib).removeClass().addClass('sort-desc');
							} else {
								$th.add($thSib).removeClass().addClass('sort-asc');
							}
						}

						// Increase state by 1
						var state = $th.data('sortState')+1;

						// Sync state across all <th> elements
						$th.add($thSib).data('sortState', state%3);

						// Reset status of other <th>
						$stickyWrap.find('table').each(function(i) {
							$(this)
							.find('thead th').not(':eq('+colIndex+')')
								.data('sortState', 1)
								.removeClass().addClass('sort-default');
						});

						// Add rows
						$t.find('tbody').html($rows);

						// Sync $stickyCol
						$t.find('tbody tr').each(function(i) {
							$stickyCol.find('tbody tr').eq(i).find('th').html($(this).find('th').first().html());
						});

					});
				}
			}
		});

		// Return to allow chaining
		return this;
	};
})(jQuery);