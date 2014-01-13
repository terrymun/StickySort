# StickySort
A jQuery plugin for tables with sticky headers, columns and sortable feature. [View demo here](http://terrymun.github.io/StickySort/).

## Introduction
StickySort is a jQuery plugin that creates sticky headers and columns on your tables, complete with the possibility to add a sortable functionality. This plugin was inspired by a recent task at work where I have to create sticky headers to allow users to orient themselves in large tables that, at many instances, fill the full height of the viewport.

You can [read my article on Codrops](http://tympanus.net/codrops/2014/01/09/sticky-table-headers-columns/) about the basic mechanisms behind the plugin. A lot of calculations are involved, so you have been warned!

Moreover, you can [visit the demo of this plugin](http://terrymun.github.io/StickySort/) on the project page hosted with GitHub.

## Installation
To install StickySort, you will have to include the following resources in your page. The JS files should be loaded in the order stipulated below. For the CSS file, you can either incorporate it with your site's stylesheet, or load it externally through the `<link>` element in `<head>`.

| Type | File Name              | Description                                                                                                            |
|------|------------------------|------------------------------------------------------------------------------------------------------------------------|
| JS   | [jQuery 1.x](http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js) | **External Dependency**: The jQuery 1.x library is needed for Fluidbox functionality.       |
| JS   | [Ben Alman's throttle/debounce plugin](http://cdnjs.cloudflare.com/ajax/libs/jquery-throttle-debounce/1.1/jquery.ba-throttle-debounce.min.js)           | **External Dependency**: This plugin allows us to throttle or debounce certain events, allowing for better browser performance. |
| JS   | `jquery.stickysort.js` | Confers the main functionality of Fluidbox. Alternatively, you can load the minified version, `jquery.fluidbox.min.js` |
| CSS  | `css/stickysort.css`   | Offers styles that are crucial for the correct display of sticky elements. The appearance will break if this is not included. |

## Usage
### Basic
It is rather straightforward to use StickySort &mdash; simply chain the `.stickySort()` method to a selector of your choice. Your table should include the following elements:

- A `<thead>` element containing **only** one single `<tr>` populated with **only** `<th>` elements (table headers)
- A `<tbody>` element containing `<td>` wrapped within one or more `<tr>`

Therefore, a sample table with the most basic usage (only sticky header will be dynamically added) should look as follow:

    <table>
        <thead>
            <tr>
                <th></th>
                <!-- add more <th> as of when needed -->
            </tr>
        </thead>
        <tbody>
            <tr>
                <td></td>
                <!-- add more <td> as of when needed -->
            </tr>
            <!-- add more rows as of when needed -->
        </tbody>
    </table>

If you would want a sticky column, too, you will need to use `<th>` for the first cells in all `<tr>` elements in your `<tbody>`, i.e.:

    <table>
        <thead>
            <tr>
                <th></th>
                <!-- add more <th> as of when needed -->
            </tr>
        </thead>
        <tbody>
            <tr>
                <th></th><!-- first cell must ne <th> -->
                <td></td><!-- other cells are <td> -->
                <!-- add more <td> as of when needed -->
            </tr>
            <!-- add more rows as of when needed -->
        </tbody>
    </table>

In your JS file, you can simply chain the `.sticktSort()` method to your selector on DOM ready, for example:

    $(function () {
        $('#content table').stickySort();
    })

### Configuration
Fluidbox can be configured according to your needs. The following options are available:

| Option           | Type      | Default value | Description                           |
|------------------|-----------|---------------|---------------------------------------|
| `threshold`      | Object    |               | Stores objects pertaining to calculating of which how far from the end of the table should the sticky header disappear. |
| `threshold.rows` | Numeric   | `3`           | Number of rows, from the bottom of the table where the sticky header will disappear. |
| `threshold.viewport` | Numeric | `0.25`      | Fraction of the current viewport height, from the bottom of the table where the sticky header will disappear. |
| `threshold.px`   | Numeric   | `false`       | Pixel value of height, from the bottom of the table where the sticky header will disappear. |
| `threshold.allowanceEval` | String | `min`   | How the above three parameters should be compared, which the plugin will choose either the smallest (`min`) or the largest (`min`) of the three values to set as the allowance/threshold. |
| `sortable`       | Boolean   | `false`       | Designates the table as sortable or not. |
| `scrollThrottle` | Numeric   | `15`          | Throttles the scroll event to relief load on JavaScript engine. 15ms is good enough to be smooth to the eye, yet not too taxing on the browser. |
| `resizeDebounce` | Numeric   | `250`         | Debounces the window resize event to relief load on JavaScript engine. |

This is how the default options look like:

    {
        threshold: {
            rows: 3,
            viewport: 0.25,
            px: false,
            allowanceEval: 'min'
        },
        sortable: false,
        scrollThrottle: 15,
        resizeDebounce: 250
    }

----

## Styling
For your convenience, here is the generated markup when the plugin detects a table in your document and does its magic:

    <div class="sticky-wrap [and other classes copied from original table]">
        <table class="sticky-enabled [and its original classes]">
            <!-- table content -->
        </table>
        <div class="sticky-col">
            <table />
        </div>
        <div class="sticky-intersect">
            <table />
        </div>
        <div class="sticky-thead">
            <table />
        </div>
    </div>

stickySort will automatically copy the classes you have set on the original table element onto its parent, so as to allow for convenient styling. However, if you are intending the style to only apply to the table element and not its parent (they will share the same classes), you should use the element selector, i.e.

    table.sample-table {
        /* table specific style that does to apply to wrapping parent */
    }

----

## Sortable
The sortable function does not rely on the default `.sort()` function in JavaScript due to its various limitations &mdash; more importantly, it makes it extremely hard to perform human sorting. Therefore, I have adopted [a function written by Brian Huisman back in 2008](http://my.opera.com/GreyWyvern/blog/show.dml/1671288), but still works beautifully today.

### Enabling sorting
Sorting is disabled by default. In order to enable the sorting function, you can either implement it universally, i.e.:

    $('table').stickySort({ sortable: true });

&hellip;or if you want to only target specific tables, the plugin will recognize tables that has the class 'sortable' or has the HTML5 data- attribute of `data-sortable`, and mark them as available for sorting.

### Sort states
There are three possible sort states with this plugin, and they can be cycled through by successive clicking. Note that sorting from one column resets the sorting state in the previous column (which is the intuitive pattern, anyway):

1. Default state &mdash; rows are not sorted, and appear as-is from the original markup
2. Sort ascending &mdash; rows are sorted by ascending order
3. Sort descending &mdash; rows are sorted by descending order