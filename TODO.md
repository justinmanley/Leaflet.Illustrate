### TODO for Leaflet.Illustrate ###

* Text inside the `<textarea>` elements should be selectable.  Tried to do this using `L.DomUtil.enableTextSelection()` and `L.DomUtil.disableTextSelection()`, but neither has any effect.  Submit a bug report?

	* May need to look at what is going on with the drag events when map dragging is enabled/disabled.
	* 'dragstart' events are not firing either on the `DivIcon` marker or on the `<textarea>` inside it.  Perhaps this has to do with how drag events are handled on markers?

* Which corner of the textbox should be attached to the map (the anchor)?  I'm not sure whether the corner or the center is better.

	* Perhaps the user should change it.  It does seem that having the anchor in the center would cause unexpected behavior on zoom.

* As in the Leaflet.draw plugin, implement two modes - a drawing mode, and an editing mode.  Automatically switch into editing mode when a textbox is drawn.  Editing mode for a textbox will mean that the textbox is outlined at all times (not just on focus), and resize, move, and rotate handles are visible.  In non-editing mode the text can be edited, but handles do not appear.

	* Is this overly complicated from a UI perspective?

* Implement text rotation using css-transforms.
	* Leaflet.draw calculates the positions of the resize handles simply by getting a `<LatLngBounds>` object from the rectangle, then getting the corners.  That won't work here, though, if the textbox is rotated.  Two approaches:

		1. Un-rotate the textbox, get the corners by the `<LatLngBounds>` method, then rotate back.
		2. Calculate mathematically using the equations for the slopes of the boundaries of the textbox (in pixel coordinates, not geographic coordinates).

	* Note that you'll need to rotate the images used as icons for the resize handles, probably also using css-transforms.

* ~~Drawing from top-left to bottom-right works fine, now - but any other drawing direction does not work because HTMl elements cannot have negative width.  How to handle this?  It doesn't seem very practical to switch the anchor latlng, but that may be what I have to do.~~

	* ~~When setSize() is called, check the parity of height and width.  The parities will indicate which quadrant the box is in, and I can then reassign the latlng anchor based on the quadrant.~~
	* ~~Perhaps the easiest way to deal with this is simply to draw using a rectangle styled to look exactly like a textbox, and then to return the textbox with the _fireCreatedEvent.~~

* Border issues:

	* When the css 'leaflet-illustrate-textbox-outlined' property is added (and the border becomes visible), because the border is *inside* the textarea, it bumps the text a little bit down and right.  This is distracting.  Try eliminating it by adding padding of the same amount as the border-width and then removing the padding when the 'leaflet-illustrate-textbox-outlined' property is added.
	* Should probably split this into separate methods: `L.Illustrate.Textbox._outline()` and `L.Illustrate.Textbox.unOutline()`.

* Change the font to make it more readable.  Add halo to text.  Good advice in this article:
	http://mappingcenter.esri.com/index.cfm?fa=ask.answers&q=1181
	https://www.google.com/earth/outreach/tutorials/user_experience.html
	https://www.mapbox.com/blog/designing-labels-satellite-imagery/