import "ol/ol.css";
import Map from "ol/Map.js";
import View from "ol/View.js";
import Feature from "ol/Feature.js";
import Overlay from "ol/Overlay.js";

import Point from "ol/geom/Point.js";
import LineString from "ol/geom/LineString.js";
import Polygon from "ol/geom/Polygon.js";
import CircleGeom from "ol/geom/Circle.js";
import MultiPoint from "ol/geom/MultiPoint.js";

import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import ImageLayer from "ol/layer/Image.js";
import Heatmap from "ol/layer/Heatmap.js";
import Graticule from "ol/layer/Graticule.js";
import WebGLVectorLayer from "ol/layer/WebGLVector.js";

import XYZ from "ol/source/XYZ.js";
import OSM from "ol/source/OSM.js";
import VectorSource from "ol/source/Vector.js";
import Static from "ol/source/ImageStatic.js";
import RasterSource from "ol/source/Raster.js";
import Cluster from "ol/source/Cluster.js";
import TileDebug from "ol/source/TileDebug.js";
import GeoJSON from "ol/format/GeoJSON.js";
// import EChartsLayer from "ol-echarts";
// import WindLayer from "ol-wind";

import Draw from "ol/interaction/Draw.js";
import Modify from "ol/interaction/Modify.js";
import Select from "ol/interaction/Select.js";
import Snap from "ol/interaction/Snap.js";
import Translate from "ol/interaction/Translate.js";
import DragBox from "ol/interaction/DragBox.js";
import DragZoom from "ol/interaction/DragZoom.js";

import { defaults as defaultInteractions } from "ol/interaction/defaults.js";

import Attribution from "ol/control/Attribution.js";
import FullScreen from "ol/control/FullScreen.js";
import MousePosition from "ol/control/MousePosition.js";
import OverviewMap from "ol/control/OverviewMap.js";
import Rotate from "ol/control/Rotate.js";
import ScaleLine from "ol/control/ScaleLine.js";
import Zoom from "ol/control/Zoom.js";
import ZoomSlider from "ol/control/ZoomSlider.js";
import ZoomToExtent from "ol/control/ZoomToExtent.js";

import { defaults as defaultControls } from "ol/control/defaults.js";

import { fromLonLat, toLonLat, transform } from "ol/proj.js";
import { getCenter, getHeight, getWidth } from "ol/extent.js";
import { getArea, getLength } from "ol/sphere.js";
import { getRenderPixel, getVectorContext } from "ol/render.js";
import { pointerMove, platformModifierKeyOnly, never, primaryAction } from "ol/events/condition.js";
import { upAndDown } from "ol/easing.js";

import Style from "ol/style/Style.js";
import Stroke from "ol/style/Stroke.js";
import Fill from "ol/style/Fill.js";
import Icon from "ol/style/Icon.js";
import Text from "ol/style/Text.js";
import CircleStyle from "ol/style/Circle.js";
import RegularShape from "ol/style/RegularShape.js";

import { DomCodeExecutor } from "./domCodeExecutor";

const moduleRegistry = {
  "ol/Map": { default: Map },
  "ol/Map.js": { default: Map },
  "ol/View": { default: View },
  "ol/View.js": { default: View },
  "ol/Feature": { default: Feature },
  "ol/Feature.js": { default: Feature },
  "ol/Overlay.js": { default: Overlay },

  "ol/geom": { LineString, Point, Polygon },
  "ol/geom/Point": { default: Point },
  "ol/geom/Point.js": { default: Point },
  "ol/geom/LineString": { default: LineString },
  "ol/geom/LineString.js": { default: LineString },
  "ol/geom/Polygon": { default: Polygon },
  "ol/geom/Polygon.js": { default: Polygon },
  "ol/geom/Circle.js": { default: CircleGeom },
  "ol/geom/MultiPoint": { default: MultiPoint },
  "ol/geom/MultiPoint.js": { default: MultiPoint },

  "ol/layer": { Tile: TileLayer, Vector: VectorLayer, Heatmap },
  "ol/layer/Tile": { default: TileLayer },
  "ol/layer/Tile.js": { default: TileLayer },
  "ol/layer/Vector": { default: VectorLayer },
  "ol/layer/Vector.js": { default: VectorLayer },
  "ol/layer/Image": { default: ImageLayer },
  "ol/layer/Image.js": { default: ImageLayer },
  "ol/layer/Heatmap.js": { default: Heatmap },
  "ol/layer/Graticule": { default: Graticule },
  "ol/layer/WebGLVector": { default: WebGLVectorLayer },

  "ol/source": { Raster: RasterSource, Vector: VectorSource, XYZ, Cluster },
  "ol/source/XYZ": { default: XYZ },
  "ol/source/XYZ.js": { default: XYZ },
  "ol/source/Vector": { default: VectorSource },
  "ol/source/Vector.js": { default: VectorSource },
  "ol/source/OSM.js": { default: OSM },
  "ol/source/ImageStatic.js": { default: Static },
  "ol/source/Raster.js": { default: RasterSource },
  "ol/source/Cluster.js": { default: Cluster },
  "ol/source/TileDebug": { default: TileDebug },
  "ol/source/TileDebug.js": { default: TileDebug },
  "ol/format/GeoJSON": { default: GeoJSON },
  "ol/format/GeoJSON.js": { default: GeoJSON },
  // "ol-echarts": { default: EChartsLayer },
  // "ol-wind": { default: WindLayer },

  "ol/interaction": { defaults: defaultInteractions, Draw, Modify, Select, Translate, Snap },
  "ol/interaction/defaults": { defaults: defaultInteractions },
  "ol/interaction/defaults.js": { defaults: defaultInteractions },
  "ol/interaction/Draw": { default: Draw },
  "ol/interaction/Draw.js": { default: Draw },
  "ol/interaction/Modify": { default: Modify },
  "ol/interaction/Modify.js": { default: Modify },
  "ol/interaction/Select.js": { default: Select },
  "ol/interaction/Snap": { default: Snap },
  "ol/interaction/Snap.js": { default: Snap },
  "ol/interaction/Translate": { default: Translate },
  "ol/interaction/Translate.js": { default: Translate },
  "ol/interaction/DragBox": { default: DragBox },
  "ol/interaction/DragBox.js": { default: DragBox },
  "ol/interaction/DragZoom.js": { default: DragZoom },

  "ol/control": {
    defaults: defaultControls,
    Attribution,
    FullScreen,
    MousePosition,
    OverviewMap,
    Rotate,
    ScaleLine,
    Zoom,
    ZoomSlider,
    ZoomToExtent,
  },
  "ol/control/defaults": { defaults: defaultControls },
  "ol/control/defaults.js": { defaults: defaultControls },
  "ol/control/Attribution.js": { default: Attribution },
  "ol/control/FullScreen.js": { default: FullScreen },
  "ol/control/MousePosition.js": { default: MousePosition },
  "ol/control/OverviewMap.js": { default: OverviewMap },
  "ol/control/Rotate.js": { default: Rotate },
  "ol/control/ScaleLine.js": { default: ScaleLine },
  "ol/control/Zoom.js": { default: Zoom },
  "ol/control/ZoomSlider.js": { default: ZoomSlider },
  "ol/control/ZoomToExtent.js": { default: ZoomToExtent },

  "ol/proj": { fromLonLat, toLonLat, transform },
  "ol/proj.js": { fromLonLat },
  "ol/extent": { getCenter, getHeight, getWidth },
  "ol/extent.js": { getCenter, getHeight, getWidth },
  "ol/sphere": { getArea, getLength },
  "ol/sphere.js": { getArea, getLength },
  "ol/render": { getRenderPixel, getVectorContext },
  "ol/render.js": { getRenderPixel, getVectorContext },

  "ol/events/condition": {
    pointerMove,
    platformModifierKeyOnly,
    never,
    primaryAction,
  },
  "ol/easing": { upAndDown },

  "ol/style": {
    Style,
    Stroke,
    Fill,
    Circle: CircleStyle,
    CircleStyle,
    Icon,
    Text,
    RegularShape,
  },
  "ol/style.js": { Style, Circle: CircleStyle, Stroke, Fill, Icon },
  "ol/style/Style": { default: Style },
  "ol/style/Style.js": { default: Style },
  "ol/style/Stroke": { default: Stroke },
  "ol/style/Stroke.js": { default: Stroke },
  "ol/style/Fill": { default: Fill },
  "ol/style/Fill.js": { default: Fill },
  "ol/style/Icon": { default: Icon },
  "ol/style/Icon.js": { default: Icon },
  "ol/style/Text.js": { default: Text },
  "ol/style/Circle": { default: CircleStyle },
  "ol/style/Circle.js": { default: CircleStyle },
  "ol/style/RegularShape.js": { default: RegularShape },
};

const openLayersContext = {
  Map,
  View,
  Feature,
  Overlay,
  Point,
  LineString,
  Polygon,
  Circle: CircleGeom,
  CircleStyle,
  MultiPoint,
  TileLayer,
  VectorLayer,
  ImageLayer,
  Heatmap,
  Graticule,
  WebGLVectorLayer,
  XYZ,
  OSM,
  VectorSource,
  Vector: VectorSource,
  Static,
  RasterSource,
  Cluster,
  TileDebug,
  GeoJSON,
  // EChartsLayer,
  // WindLayer,
  Draw,
  Modify,
  Select,
  Snap,
  Translate,
  DragBox,
  DragZoom,
  defaultInteractions,
  Attribution,
  FullScreen,
  MousePosition,
  OverviewMap,
  Rotate,
  ScaleLine,
  Zoom,
  ZoomSlider,
  ZoomToExtent,
  defaultControls,
  fromLonLat,
  toLonLat,
  transform,
  getCenter,
  getHeight,
  getWidth,
  getArea,
  getLength,
  getRenderPixel,
  getVectorContext,
  pointerMove,
  platformModifierKeyOnly,
  never,
  primaryAction,
  upAndDown,
  Style,
  Stroke,
  Fill,
  Icon,
  Text,
  RegularShape,
};

export class OpenLayersCodeExecutor extends DomCodeExecutor {
  constructor(hostElement) {
    super(hostElement, () => openLayersContext, moduleRegistry);
  }
}
