import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {
  private readonly baseUrl = environment.strapi.url; 

  constructor(private http:HttpClient) { }

}