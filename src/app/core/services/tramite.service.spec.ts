import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TramiteService } from './tramite.service';
import { Tramite } from '../models/tramite.model';

const mockTramite: Tramite = {
  id: 1,
  type: 'habilitacion',
  title: 'Habilitación local comercial',
  description: 'Solicitud de habilitación para local en Av. Corrientes 1234',
  applicantName: 'Juan Pérez',
  applicantDni: '28456789',
  applicantEmail: 'juan@mail.com',
  address: 'Av. Corrientes 1234',
  documents: [],
  status: 'pending',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

describe('TramiteService', () => {
  let service: TramiteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(TramiteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getAll() returns list of tramites', () => {
    service.getAll().subscribe(list => {
      expect(list.length).toBe(1);
      expect(list[0].type).toBe('habilitacion');
    });
    httpMock.expectOne(r => r.url.includes('/tramites')).flush([mockTramite]);
  });

  it('getByDni() filters by DNI param', () => {
    service.getByDni('28456789').subscribe(list => expect(list.length).toBe(1));
    const req = httpMock.expectOne(r => r.url.includes('/tramites'));
    expect(req.request.params.get('applicantDni')).toBe('28456789');
    req.flush([mockTramite]);
  });

  it('create() POSTs with pending status', () => {
    const { id, status, createdAt, updatedAt, ...payload } = mockTramite;
    service.create(payload).subscribe(t => expect(t.status).toBe('pending'));
    const req = httpMock.expectOne(r => r.url.includes('/tramites'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.status).toBe('pending');
    req.flush(mockTramite);
  });
});
