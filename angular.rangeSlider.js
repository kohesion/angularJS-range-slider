angular.module('rangeSlider', []).directive('slider', ['$parse', function ($parse) {
	var Draggable = function (scope, elem, offset) {
		var width = scope.width,
			widthHandle = scope.widthHandle,
			min = scope.min,
			max = scope.max,
			low = scope.low,
			high = scope.high,
			interval = scope.interval;

		var that = this;

		this.adjustValueForInterval = function (val) {
			return val - (val + interval / 2) % interval + (interval / 2);
		};

		this.convertPixelsToValue = function (xPos) {
			var val = ((xPos / width) * (max - min) + min);
			return that.adjustValueForInterval(val);
		};

		this.convertValueToPixels = function (val) {
			return Math.min(Math.max((val - min) / (max - min) * width, 0), width);
		};

		this.updateHandle = function (elem, diff) {
			var indicator = elem.querySelector('span');

			var pos = Math.min(width, Math.max(0, diff));

			var index = (elem.className.indexOf('low') > -1) ? 0 : 1;

			if (index === 0) {
				elem.style.left = (that.convertValueToPixels(scope.low = that.convertPixelsToValue(pos)) - widthHandle/2) + 'px';
				scope.leftLow = pos;
				var other = elem.nextElementSibling;
				if (elem.offsetLeft >= parseFloat(other.style.left)) {
					other.style.left = (posOther = elem.offsetLeft + widthHandle * 1.5) + 'px';
					other.querySelector('span').innerText = that.convertPixelsToValue(Math.min(width, Math.max(0, posOther)));
				}
				indicator.style.left = -offset + 'px';
			}
			else {
				elem.style.left = (that.convertValueToPixels(scope.high = that.convertPixelsToValue(pos)) - widthHandle/2) + 'px';
				scope.leftHigh = pos;
				var other = elem.previousElementSibling;
				if (elem.offsetLeft <= parseFloat(other.style.left)) {
					var posOther;
					other.style.left = (posOther = elem.offsetLeft - widthHandle * 1.5) + 'px';
					other.querySelector('span').innerText = that.convertPixelsToValue(Math.min(width, Math.max(0, posOther)));
				}
				indicator.style.left = offset + 'px';
			}
			indicator.innerText = that.convertPixelsToValue(pos).toFixed(0);
		};


		////////////////////// code for touch devices //////////////////////////////////////
			var handleTouchStart = function (e) {
				e.preventDefault();
				var start, diff, initialPosition = parseFloat(elem.style.left);

				start = e.touches[0].clientX;

				var indicator = elem.querySelector('span');
				/*
				var intervalUpdate = setInterval(function () {
					//elem.dispatchEvent(new MouseEvent('mouseup'));
				}, 1000);
				*/

				var handleTouchMove = function (e) {		   
					e.preventDefault();
					e.stopPropagation();

					var end = e.touches[0].clientX;

					diff = end - start;

					requestAnimationFrame(function () {
						that.updateHandle(elem, initialPosition + diff);
					});

				};

				var handleTouchEnd = function (e) {
					e.preventDefault();
					e.stopPropagation();

					elem.removeEventListener('touchmove', handleTouchMove);
					elem.removeEventListener('touchend', handleTouchEnd);
					elem.dispatchEvent(new MouseEvent('mouseup'));
					//clearInterval(intervalUpdate);
				};

				elem.style.position = 'absolute';

				elem.addEventListener('touchmove', handleTouchMove, false);

				elem.addEventListener('touchend', handleTouchEnd, false);
			}; // end touch start

			elem.addEventListener('touchstart', handleTouchStart, false); // end touchstart


///////////////////////////// code for non-touch devices ////////////////////////////////////////////
			elem.onmousedown = function (e) {
				var clickPositionOnHandle = e.offsetX - widthHandle/2, position;

				var intervalUpdate = setInterval(function () {
					elem.dispatchEvent(new MouseEvent('mouseup'));
				}, 1500);

				e.preventDefault();

				elem.style.position = 'absolute';
				elem.onmousemove = function (evt) { evt.stopPropagation(); }
				elem.parentNode.parentNode.onmousemove = function (e) {
					e.preventDefault();
 
					position = e.offsetX;
					position = position + clickPositionOnHandle;
					requestAnimationFrame(function () {
						that.updateHandle(elem, position);
					});
				};
				elem.parentNode.parentNode.onmouseleave = function (e) {

					if(e.offsetX >= width) {
						requestAnimationFrame(function () {
							that.updateHandle(elem, width);
						});
					}

				};

				elem.onclick = function (e) {
					e.stopPropagation();
				};

				document.body.onmouseup = function (e) {
					//e.preventDefault();
					//e.stopImmediatePropagation();

					elem.parentNode.parentNode.onmousemove = elem.parentNode.parentNode.onmouseleave = document.body.onmouseup = null;

					clearInterval(intervalUpdate);
				};
			}; // end onmousedown

	}; // end make draggable

	return {
		restrict: 'E',
		template: '<div style="display: table; position: relative; width: {{width}}px;padding-left: 5px;padding-right: 5px; box-sizing: content-box;">\
			<div style="position: absolute; width: inherit; height: 10px; top: -20px;"><span style="position: absolute; left: 0px;">{{min}}</span><span style="position: absolute; right: 0px;">{{max}}</span></div>\
			<div class="containerSlider" style="position: relative;padding-top: 10px; padding-bottom: 10px;">\
				<div class="rangeBar" ng-click="adjustToClick($event)" style="height: 10px; width: 100%; background-color: #f6f6f6; border: 1px solid #d6d6d6;">\
					<div class="sliderControl low" ng-mouseup="handleLowSlideMove($event)" style="position: absolute; left: {{leftLow-widthHandle/2}}px; top: 1px; background-color: #DDDDDD; border: 2px solid #c3c3c3; border-radius: 15px; width: {{widthHandle}}px; height: 28px;"><span style="position: absolute; top: 30px; left: -15px;"></span></div>\
					<div class="sliderControl high" ng-mouseup="handleHighSlideMove($event)" style="position: absolute; left: {{leftHigh-widthHandle/2}}px; top: 1px; background-color: #DDDDDD; border: 2px solid #c3c3c3; border-radius: 15px; width: {{widthHandle}}px; height: 28px;"><span style="position: absolute; top: 30px; left: -20px;"></span></div>\
				</div>\
			</div>\
		</div>',
		scope: {
			min: '=',
			max: '=',
			low: '=',
			high: '=',
			setterLow: '&',
			setterHigh: '&',
			width: '@',
			interval: '@',
			promiseInit: '=',
			widthHandle: '@'
		},
		link: function (scope, node, attrs) {
			scope.promiseInit.then(function () {
				setTimeout(function () {
					var min = parseFloat(scope.min),
					max = parseFloat(scope.max),
					high = parseFloat(scope.high),
					low = parseFloat(scope.low),
					width = parseInt(scope.width),
					interval = parseInt(scope.interval);


					var adjustLowSlidePosition = function (low) {
						leftLow = parseFloat(scope.leftLow);
						leftHigh = parseFloat(scope.leftHigh);
						high = parseFloat(scope.high);


						var elem = node[0].querySelector('.low');
						var left = scope.dragHandleLow.convertValueToPixels(low);
						scope.leftLow = left;

						scope.dragHandleLow.updateHandle && scope.dragHandleLow.updateHandle(elem, left);
					};

					var adjustHighSlidePosition = function (high) {
						leftLow = parseFloat(scope.leftLow);
						leftHigh = parseFloat(scope.leftHigh);
						low = parseFloat(scope.low);

						var elem = node[0].querySelector('.high');
						var left = scope.dragHandleHigh.convertValueToPixels(high);
						scope.leftHigh = left;

						scope.dragHandleHigh.updateHandle && scope.dragHandleHigh.updateHandle(elem, left);
					};

					scope.$watch('low', adjustLowSlidePosition);
					scope.$watch('high', adjustHighSlidePosition);

					scope.adjustToClick = function (evt) {
						leftLow = parseFloat(scope.leftLow);
						leftHigh = parseFloat(scope.leftHigh);

						if (Math.abs(evt.offsetX - leftLow) < Math.abs(evt.offsetX - leftHigh)) {
							scope.leftLow = evt.offsetX;
							scope.low = scope.dragHandleLow.convertPixelsToValue(evt.offsetX);
						}
						else {
							scope.leftHigh = evt.offsetX;
							scope.high = scope.dragHandleHigh.convertPixelsToValue(evt.offsetX);
						}
					};

					scope.handleLowSlideMove = function (evt) {
						min = parseFloat(scope.min);
						max = parseFloat(scope.max);

						var low = scope.dragHandleLow.convertPixelsToValue(evt.target.offsetLeft + 14);
						var high = scope.dragHandleHigh.convertPixelsToValue(node[0].querySelector('.high').offsetLeft + 14);

						scope.setterLow({ low: low });
					};

					scope.handleHighSlideMove = function (evt) {
						min = parseFloat(scope.min);
						max = parseFloat(scope.max);

						var high = scope.dragHandleHigh.convertPixelsToValue(evt.target.offsetLeft + 14);
						var low = scope.dragHandleLow.convertPixelsToValue(node[0].querySelector('.low').offsetLeft + 14);

						scope.setterHigh({ high: high });
					};


					scope.dragHandleLow = new Draggable(scope, node[0].querySelectorAll('.sliderControl')[0], 15, width, min, max, interval);
					scope.dragHandleHigh = new Draggable(scope, node[0].querySelectorAll('.sliderControl')[1], 10, width, min, max, interval);
				}, 1000);
			});
		}
	}
}]);
