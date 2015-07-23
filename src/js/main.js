interact('.slider')                   // target the matches of that selector
    .origin('self')                     // (0, 0) will be the element's top-left
    .draggable({                        // make the element fire drag events
        max: Infinity,                     // allow drags on multiple elements
        restrict: {
            restriction: 'self'
        }
    })
    .on('dragmove', function (event) {  // call this function on every move
        var sliderHeight = interact.getElementRect(event.target).height,
            value = event.pageY / sliderHeight;

        $(event.target).find('.slider_content').css('top', (value * 100) + '%');
        event.target.setAttribute('data-value', (1 - value).toFixed(2));
    });

interact.maxInteractions(Infinity);   // Allow multiple interactions