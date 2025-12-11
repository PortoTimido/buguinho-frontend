import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BugService } from '../../Services/bug.service';
import { bugField } from '../../Interfaces/bugField';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('developerChart', { static: false }) developerRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('projectChart', { static: false }) projectRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart', { static: false }) statusRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('severityChart', { static: false }) severityRef!: ElementRef<HTMLCanvasElement>;

  private developerChart: any;
  private projectChart: any;
  private statusChart: any;
  private severityChart: any;

  constructor(private bugService: BugService) {}

  ngAfterViewInit(): void {
    this.bugService.getAll().subscribe({
      next: (contacts: bugField[]) => this.initCharts(contacts),
      error: () => this.initCharts([])
    });
  }

  private initCharts(contacts: bugField[]): void {
    const stats = this.calculateBugStatistics(contacts);

    const devCtx = this.developerRef.nativeElement.getContext('2d');
    if (!devCtx) return;
    const devLabels = Object.keys(stats.byDeveloper);
    const devData = devLabels.map(l => stats.byDeveloper[l]);
    this.developerChart = new Chart(devCtx, {
      type: 'doughnut',
      data: {
        labels: devLabels,
        datasets: [{ 
          data: devData, 
          backgroundColor: devLabels.map(() => this.randomColor())
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    const projectCtx = this.projectRef.nativeElement.getContext('2d');
    if (!projectCtx) return;
    const projectLabels = Object.keys(stats.byProject);
    const projectData = projectLabels.map(l => stats.byProject[l]);
    const projectColors = ['#ff0000ff', '#bd4708ff', '#1F8519', '#1586ffff'];
    this.projectChart = new Chart(projectCtx, {
      type: 'bar',
      data: {
        labels: projectLabels,
        datasets: [{ 
          label: 'Quantidade',
          data: projectData, 
          backgroundColor: projectColors
        }]
      },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
    });

    const statusCtx = this.statusRef.nativeElement.getContext('2d');
    if (!statusCtx) return;
    const statusLabels = ['Aberto', 'Em Progresso', 'Resolvido', 'Fechado'];
    const statusData = [stats.byStatus.aberto, stats.byStatus.emProgresso, stats.byStatus.resolvido, stats.byStatus.fechado];
    const statusColors = ['#ff0000ff', '#bd4708ff', '#1F8519', '#1586ffff'];
    this.statusChart = new Chart(statusCtx, {
      type: 'bar',
      data: {
        labels: statusLabels,
        datasets: [{ 
          label: 'Quantidade',
          data: statusData, 
          backgroundColor: statusColors
        }]
      },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
    });

    const severityCtx = this.severityRef.nativeElement.getContext('2d');
    if (!severityCtx) return;
    const severityLabels = ['Crítico', 'Alta', 'Média', 'Baixa'];
    const severityData = [stats.bySeverity.critico, stats.bySeverity.alta, stats.bySeverity.media, stats.bySeverity.baixa];
    const severityColors = ['#ff0000ff', '#bd4708ff', '#1F8519', '#1586ffff'];
    this.severityChart = new Chart(severityCtx, {
      type: 'pie',
      data: {
        labels: severityLabels,
        datasets: [{ 
          data: severityData, 
          backgroundColor: severityColors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private calculateBugStatistics(contacts: bugField[]) {
    const result = {
      total: contacts.length,
      bySeverity: { critico: 0, alta: 0, media: 0, baixa: 0 },
      byStatus: { aberto: 0, emProgresso: 0, resolvido: 0, fechado: 0 },
      byDeveloper: {} as { [key: string]: number },
      byProject: {} as { [key: string]: number }
    };

    contacts.forEach((bug: bugField) => {
      const criticality = (bug.severidade || '').toLowerCase();
      if (criticality.includes('crit') || criticality.includes('crítico')) result.bySeverity.critico++;
      else if (criticality.includes('alto') || criticality.includes('alta')) result.bySeverity.alta++;
      else if (criticality.includes('medio') || criticality.includes('médio') || criticality.includes('média')) result.bySeverity.media++;
      else result.bySeverity.baixa++;

      const status = (bug.status || '').toLowerCase();
      if (status.includes('aberto')) result.byStatus.aberto++;
      else if (status.includes('progresso') || status.includes('em')) result.byStatus.emProgresso++;
      else if (status.includes('resolvido') || status.includes('resolve')) result.byStatus.resolvido++;
      else result.byStatus.fechado++;

      const dev = bug.desenvolvedorResponsavel || 'Não atribuído';
      result.byDeveloper[dev] = (result.byDeveloper[dev] || 0) + 1;

      const project = bug.projeto || 'Não atribuído';
      result.byProject[project] = (result.byProject[project] || 0) + 1;
    });

    return result;
  }

  private randomColor(): string {
    const r = Math.floor(Math.random() * 200) + 20;
    const g = Math.floor(Math.random() * 200) + 20;
    const b = Math.floor(Math.random() * 200) + 20;
    return `rgb(${r}, ${g}, ${b})`;
  }

  ngOnDestroy(): void {
    try { this.developerChart?.destroy(); } catch {}
    try { this.projectChart?.destroy(); } catch {}
    try { this.statusChart?.destroy(); } catch {}
    try { this.severityChart?.destroy(); } catch {}
  }

}
