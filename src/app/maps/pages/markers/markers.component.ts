import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarkerColor {
  color: string,
  marker?: mapboxgl.Marker,
  center?: [number, number]
}

@Component({
  selector: 'app-markers',
  templateUrl: './markers.component.html',
  styles: [`
  .map-container{
    height: 100%;
    width: 100%;
  }
  .list-group{
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100;
  }
  li{
    cursor: pointer
  }
`]
})
export class MarkersComponent implements AfterViewInit {

  @ViewChild('map') divMap!: ElementRef;
  map!: mapboxgl.Map;
  zoomLevel: number = 15;
  center: [number, number] = [-73.110500, 7.1093711];
  marks: MarkerColor[] = []

  constructor() { }

  ngAfterViewInit(): void {
    this.map = new mapboxgl.Map({
      container: this.divMap.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel
    })

    this.readLocal()
  }

  goToMark(marker: mapboxgl.Marker) {
    this.map.flyTo({
      center: marker?.getLngLat()
    })


  }
  addMark() {

    const color = "#xxxxxx".replace(/x/g, y => (Math.random() * 16 | 0).toString(16));

    const newMarker = new mapboxgl.Marker({
      draggable: true,
      color
    })
      .setLngLat(this.center)
      .addTo(this.map)

    this.marks.push({
      color,
      marker: newMarker
    })

    this.saveToLocal()

    newMarker.on('dragend', () => this.saveToLocal())
  }

  saveToLocal() {

    const lngLatArr: MarkerColor[] = []

    this.marks.forEach(m => {
      const color = m.color
      const { lng, lat } = m.marker!.getLngLat();
      lngLatArr.push({
        color,
        center: [lng, lat],
      })
    })

    localStorage.setItem('markers', JSON.stringify(lngLatArr))
  }


  readLocal() {
    if (!localStorage.getItem('markers')) return

    const lngLatArr: MarkerColor[] = JSON.parse(localStorage.getItem('markers')!)

    lngLatArr.forEach(m => {
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true,
      })
        .setLngLat(m.center!)
        .addTo(this.map)

      this.marks.push({
        marker: newMarker,
        color: m.color
      })

      newMarker.on('dragend', () => this.saveToLocal())

    })

  }
  deleteMarker(index: number) {
    this.marks[index].marker?.remove()
    this.marks.splice(index, 1)
    this.saveToLocal()
  }

}
