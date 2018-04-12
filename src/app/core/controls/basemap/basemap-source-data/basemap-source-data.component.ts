import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-basemap-source-data',
  templateUrl: './basemap-source-data.component.html',
  styleUrls: ['./basemap-source-data.component.scss']
})
export class BasemapSourceDataComponent implements OnInit {

  @Input() name: string;

  constructor() { }

  ngOnInit() {
  }

}
