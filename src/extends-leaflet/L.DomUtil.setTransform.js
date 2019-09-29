if (L.DomUtil) {
	L.DomUtil.getTranslateString = function (point) {
		var is3d = L.Browser.webkit3d,
		    open = 'translate' + (is3d ? '3d' : '') + '(',
		    close = (is3d ? ',0' : '') + ')';

		return open + point.x + 'px,' + point.y + 'px' + close;
	};
	L.DomUtil.setTransform = function (el, point, angle, disable3D) {

		// jshint camelcase: false
		el._leaflet_pos = point;

		if (!disable3D && L.Browser.any3d) {
			el.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(point);
			el.style[L.DomUtil.TRANSFORM] = el.style[L.DomUtil.TRANSFORM] + " " + L.DomUtil.getRotateString(angle, 'rad');
		} else {
			// if 3d is disabled, then there is no rotation at all
			el.style.left = point.x + 'px';
			el.style.top = point.y + 'px';
		}
	};
}