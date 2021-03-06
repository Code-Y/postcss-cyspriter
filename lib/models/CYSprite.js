'use strict';

import * as _ from 'lodash';
import * as p from 'path';
import u from 'url';
import configs from '../configs/default.js';
import { isTruthy } from '../helpers/utils.js';
import { SPRITE_LAYOUT } from '../helpers/utils.js';
const EXT = 'png';

class CYSprite {
  constructor(rule, path, options) {
    options = CYSprite.mergeOptions(rule, options);

    this.cacheBuster = new Date().getTime();
    this.originalSelector = rule.selector;
    this.selector = rule.selector.replace(configs.NAMESPACE, '');
    this.name = this.selector.substring(1);
    this.filename = `${this.name}.${EXT}`;
    this._inputDir = path;
    this._outputDir = options.dest;
    this.output = p.resolve(this._outputDir, this.filename);
    this.url = CYSprite.makeUrl(
      this.filename, this._outputDir, options.httpDest,
      options.relativeTo, options.cacheBuster, this.cacheBuster
    );
    this._size = {
      width: 0,
      height: 0
    };
    this._cssBackgroundSize = '';
    this._images = {
      pathList: [],
      imageList: []
    };
    this.rule = rule;
    this._options = options;
  }

  get size() {
    return this._size;
  }

  set size(size) {
    this._size = size;

    let {width, height} = size;

    width = this.isRetina ? width / this.ratio : width;
    height = this.isRetina ? height / this.ratio : height;

    this.cssBackgroundSize = `${width + 'px'} ${height + 'px'}`;
  }

  get cssBackgroundSize() {
    return this._cssBackgroundSize;
  }

  set cssBackgroundSize(size) {
    this._cssBackgroundSize = size;
  }

  get includeSize() {
    return this._options.includeSize;
  }

  get decorate() {
    return this._options.decorate;
  }

  get debug() {
    return this._options.debug;
  }

  get isRetina() {
    return this._options.retina;
  }

  get ratio() {
    return this._options.ratio;
  }

  get padding() {
    return this._options.padding;
  }

  get layout() {
    return this._options.layout;
  }

  get imageList() {
    return this._images.imageList;
  }

  get imagePaths() {
    return this._images.pathList;
  }

  get length() {
    return this._images.pathList.length;
  }

  addImage(image) {
    this._images.pathList.push(image.path);

    image.sprite = this;

    this._images.imageList.push(image);
  }

  getImage(absPath) {
    for (var i = 0, l = this._images.imageList.length; i < l; i++) {
      var image = this._images.imageList[i];
      if (image.path === absPath)
        return image;
    }
    return false;
  }

  getTime() {
    return new Date(this.cacheBuster).toLocaleString();
  }

  static mergeOptions(rule, options) {
    let _options = _.merge({}, options, {
      layout: SPRITE_LAYOUT.default,
      debug: options.verbose
    });

    rule.walkDecls(configs.NAMESPACE_REGEX, function(decl) {
      let prop = (decl.prop || '')
        .replace(/(')|(")/gi, '')
        .replace(configs.NAMESPACE, '')
        .replace(/^-/, '')
        .toLowerCase()
        ;

      let value = (decl.value || '')
        .replace(/(')|(")/gi, '')
        .toLowerCase()
        ;

      switch (prop) {
        case 'debug':
          _options.debug = isTruthy(value);
          break;

        case 'padding':
          let padding = parseInt(value, 10);
          isNaN(padding) || (_options.padding = padding);
          break;

        case 'retina':
          _options.retina = isTruthy(value);
          break;

        case 'cacheBuster':
        case 'cache':
        case 'cache-buster':
          _options.cacheBuster = isTruthy(value);
          break;

        case 'ratio':
          _options.ratio = isNaN(value) ? _options.ratio : Number(value);
          break;

        case 'layout':
          _options.layout =
            SPRITE_LAYOUT.hasOwnProperty(value) ? value : SPRITE_LAYOUT.default;
          break;

        case 'decorate':
          _options.decorate = isTruthy(value);
          break;

        case 'include-size':
        case 'includesize':
          _options.includeSize = isTruthy(value);
          break;
      }

      decl.remove();
    });

    return _options;
  }

  static makeUrl(filename, outputDir, httpDest, relativeTo, cacheBuster, ts) {
    let url;

    if (httpDest) {
      (httpDest[httpDest.length - 1] === '/') || (httpDest += '/');

      url = u.resolve(httpDest, filename);
    } else if (relativeTo) {
      url = p.join(p.relative(relativeTo, outputDir), filename);
    } else {
      url = p.join(outputDir, filename);
    }

    if(cacheBuster)
      url += `?${ts}`;

    return url;
  }

  static Factory(rule, path, options) {
    return new CYSprite(rule, path, options);
  }
}

export default CYSprite.Factory;
