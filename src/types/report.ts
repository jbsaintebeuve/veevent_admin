export interface Report {
  reportType: string;
  description: string;
  _links: any;
}

export interface ReportsApiResponse {
  _embedded: {
    reports: Report[];
  };
  _links: any;
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
