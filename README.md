# Flood simulator

## Installation

- Put point data in `public/restricted/points.json`.
- Put flood data in `public/restricted/data/`.
- Put map chunked data in `public/restricted/images/map`.

### Data format

#### Point data

`points.json` is array of following JSON object.

Field name   | type   | Description
-------------|--------|---------------------------------------
name         | string | Unique identifier for the point.
display_name | string | Name which is displayed.
address      | string | Address of the point.
img          | string | Thumbnail image URL.
x            | number | X-coordinate that the point displayed.
y            | number | Y-coordinate that the point displayed.

#### Flood data

The name of flood data must be `[name].json`. `name` is the string
that you specified in `points.json`.  
Flood data is following JSON object.

Field name  | Type    | Description
------------|---------|-----------------------------------------------------
name        | string  | Display name.
img         | string  | URL for background image.
points      | array   | Array of JSON object described in following section.
depth       | array   | Array of depth.
depth_place | integer | Index of point that depth card displayed.
speed       | number  | Array of flow velocity.
info        | array   | Array of JSON object described in following section.

##### `points`

`points` consists of array of x, y coordinate of vertex.
Left-top is `(0, 0)` and Right-bottom is `(1, 1)`.  
Example:

```json
        [
            [0, 1],
            [0.22806451612903206, 1],
            [0.21838709677419338, 1],
            [0.46322580645161276, 1],
            [0.4651612903225804, 1],
            [0.9480645161290343, 1],
            [1, 1],
            [1, 1],
            [0, 1]
        ],
        [
            [0, 0.7541935483870971],
            [0.22806451612903206, 0.7412903225806452],
            [0.21838709677419338, 0.7658064516129031],
            [0.46322580645161276, 0.7425806451612915],
            [0.4651612903225804, 0.7283870967741938],
            [0.9480645161290343, 0.6896774193548383],
            [1, 0.6935483870967741],
            [1, 1],
            [0, 1]
        ],
        ...
```

##### `info`

`info` is array of following JSON object.

Name    | Type   | Description
--------|--------|-------------------
title   | string | Title of the info.
content | string | Text content.

## Copyright

Written by Koki Fukuda and licensed under the Apache license, version 2.
