#entities

En- & decoder for XML/HTML entities.

####Features:
* Focussed on ___speed___
* Supports three levels of entities: __XML__, __HTML4__ & __HTML5__
    * Supports _char code_ entities (eg. `&#x55;`)
    * Special optimizations for XML: A more restrictive syntax allows faster parsing

##How to…

###…install `entities`

    npm install entities

###…use `entities`

```javascript
//encoding
require("entities").encode(<str> data[, <int> level]);
//decoding
require("entities").decode(<str> data[, <int> level]);
```

The `level` attribute indicates what level of entities should be decoded (0 = XML, 1 = HTML4 and 2 = HTML5). The default is 0 (read: XML).

There are also methods to access the level directly. Just append the name of the level to the action and you're ready to go (e.g. `encodeHTML4(data)`, `decodeXML(data)`).

##TODO
* There should be a way to remove tables that aren't used. The HTML5 table is pretty heavy, if it's not needed, it shouldn't be kept in memory.