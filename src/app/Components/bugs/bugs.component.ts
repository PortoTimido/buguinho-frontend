import { Component, OnInit } from '@angular/core';
import { bugField } from '../../Interfaces/bugField';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BugService } from '../../Services/bug.service';
import { devField } from '../../Interfaces/devField';
import { DeveloperService } from '../../Services/developer.service';
import { ProjectService } from '../../Services/project.service';
import { projetoField } from '../../Interfaces/projectField';

@Component({
  selector: 'app-bugs',
  standalone: false,
  templateUrl: './bugs.component.html',
  styleUrls: ['./bugs.component.css']
})
export class BugsComponent implements OnInit {
  bugs: bugField[] = [];
  bug: bugField | null = null;
  formGroupbug: FormGroup;
  isEditing: boolean = false;
  mensagem: string = '';
  searchTerm: string = '';
  selectedCategory: string = '';
  filteredbugs: bugField[] = [];
  submitted = false;
  mensagemError: string = '';

  bugStatistics = {
    total: 0,
    bySeverity: { alta: 0, media: 0, baixa: 0 },
    byStatus: { aberto: 0, emProgresso: 0, fechado: 0 },
    byDeveloper: {} as { [key: string]: number }
  };

  developers: devField[] = [];
  projects: projetoField[] = [];

  constructor(
              private bugService: BugService,
              private formBuilder: FormBuilder,
              private developerService: DeveloperService,
              private projectService: ProjectService
  ) { 
    this.formGroupbug = formBuilder.group({        
      id: [''],
      titulo: [''],
      projeto: [''],
      descricao: [''],
      tipo: [''],
      dataIdentificacao: [''],
      desenvolvedorResponsavel: [''],
      severidade: [''],
      status: ['']
    });
    
  }

  ngOnInit(): void {
    this.loadbugs();
    this.loadDevelopers();
    this.loadProjects();

    this.formGroupbug.get('titulo')?.valueChanges?.subscribe(() => {
      this.filterbugs();
    });
    
    this.formGroupbug.get('desenvolvedorResponsavel')?.valueChanges?.subscribe(() => {
      this.filterbugs();
    });
  }

  get uniqueDevelopers(): string[] {
    return Array.from(new Set(this.bugs.map(b => b.desenvolvedorResponsavel).filter(Boolean)));
  }

  loadbugs(){
    this.bugService.getAll().subscribe({
      next: (json) => { 
        this.bugs = json;
        this.calculateBugStatistics();
        this.filterbugs();
      },
      error: () => {
        this.bugs = [];
      }
    })
  }

  loadDevelopers(): void {
    this.developerService.getAll().subscribe({
      next: (json) => { this.developers = json || []; },
      error: () => { this.developers = []; }
    });
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (json) => { this.projects = json || []; },
      error: () => { this.projects = []; }
    });
  }

  selectById(bug: bugField) {
    this.bugService.selectById(bug).subscribe({
      next: (json) => { this.bug = json; }
    })
  }

  delete(bugs: bugField) {
    const confirmar = confirm(`Tem certeza que deseja excluir o bug com id "${bugs.id}"?`);
    if (confirmar) {
      this.bugService.delete(bugs).subscribe({
        next: () => this.loadbugs()
      });
    }
  }

  onClickUpdate(bugs: bugField) {
    this.isEditing = true;
    this.formGroupbug.patchValue(bugs);
  }

  update() {
    this.submitted= true;
    if (this.formGroupbug.invalid) {
      this.mensagemError = 'Preencha todos os campos obrigatórios.';
      setTimeout(() => this.mensagemError = '', 3000);
      return;
    }
    this.bugService.update(this.formGroupbug.value).subscribe(
      {
        next: () => {
          this.mensagem = 'Bug atualizado com sucesso!';
          setTimeout(() => this.mensagem = '', 3000);
          this.loadbugs();
          this.clear();
        },
        error: () => {
          this.mensagemError = 'Erro ao atualizar bug.';
          setTimeout(() => this.mensagemError = '', 3000);
        }
      }
    )
  }

  updateAndCloseModal() {
    this.update();
    const modal = document.getElementById('UpdateModal');
    if (modal) {
      const bsModal = (window as any).bootstrap?.Modal?.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    }
  }

  save() {
    this.submitted = true;
    if (this.formGroupbug.invalid) {
      this.mensagemError = 'Preencha todos os campos obrigatórios.';
      setTimeout(() => this.mensagemError = '', 3000);
      return;
    }

    this.bugService.save(this.formGroupbug.value as bugField).subscribe({
      next: (json: bugField) => {
        this.bugs.push(json);
        this.formGroupbug.reset();
        this.mensagem = 'Bug cadastrado com sucesso!';
        setTimeout(() => this.mensagem = '', 3000);
        this.loadbugs();
      },
      error: () => {
        this.mensagemError = 'Erro ao salvar bug.';
        setTimeout(() => this.mensagemError = '', 3000);
      }
    });
  }

  clear() {
    this.isEditing = false;
    this.formGroupbug.reset();
  }
  filterbugs(): void {
    const term = (this.searchTerm || '').toLowerCase();
    const developer = this.selectedCategory || '';

    this.filteredbugs = this.bugs.filter(b => {
      const safeTitle = (b.titulo || '').toString().toLowerCase();
      const safeDescription = (b.descricao || '').toString().toLowerCase();
      const safeProject = (b.projeto || '').toString().toLowerCase();
      const safeType = (b.tipo || '').toString().toLowerCase();

      const matchesTerm = term === ''
        ? true
        : (safeTitle.includes(term) || safeDescription.includes(term) || safeProject.includes(term) || safeType.includes(term));

      const matchesDeveloper = developer ? (b.desenvolvedorResponsavel || '') === developer : true;

      return matchesTerm && matchesDeveloper;
    });
  }

  public calculateAge(dateBorn: string): number {

    if (!dateBorn) return 0;

    let birthDate: Date | null = null;

    if (/^\d{8}$/.test(dateBorn)) {
      const day = parseInt(dateBorn.substring(0, 2), 10);
      const month = parseInt(dateBorn.substring(2, 4), 10);
      const year = parseInt(dateBorn.substring(4, 8), 10);
      birthDate = new Date(year, month - 1, day);
    }

    if (!birthDate || isNaN(birthDate.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  calculateBugStatistics(): void {
    this.bugStatistics = {
      total: this.bugs.length,
      bySeverity: { alta: 0, media: 0, baixa: 0 },
      byStatus: { aberto: 0, emProgresso: 0, fechado: 0 },
      byDeveloper: {}
    };

    this.bugs.forEach((bug: bugField) => {
      const criticality = (bug.severidade || '').toLowerCase();
      if (criticality.includes('alto') || criticality.includes('crit')) this.bugStatistics.bySeverity.alta++;
      else if (criticality.includes('medio') || criticality.includes('médio') || criticality.includes('média')) this.bugStatistics.bySeverity.media++;
      else this.bugStatistics.bySeverity.baixa++;

      const status = (bug.status || '').toLowerCase();
      if (status.includes('aberto')) this.bugStatistics.byStatus.aberto++;
      else if (status.includes('progresso') || status.includes('em')) this.bugStatistics.byStatus.emProgresso++;
      else this.bugStatistics.byStatus.fechado++;

      const developer = bug.desenvolvedorResponsavel || 'Não atribuído';
      this.bugStatistics.byDeveloper[developer] = (this.bugStatistics.byDeveloper[developer] || 0) + 1;
    });
  }
  
}
