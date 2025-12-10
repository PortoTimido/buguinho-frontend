import { Component, OnInit } from '@angular/core';
import { devField } from '../../Interfaces/devField';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeveloperService } from '../../Services/developer.service';

@Component({
  selector: 'app-developer',
  standalone: false,
  templateUrl: './developer.component.html',
  styleUrls: ['./developer.component.css']
})
export class DeveloperComponent implements OnInit {

  developers: devField[] = [];
  filteredDevelopers: devField[] = [];
  formGroupDeveloper: FormGroup;
  isEditing: boolean = false;
  mensagem: string = '';
  mensagemError: string = '';
  submitted= false;
  searchTerm: string = '';
  selectedCargo: string = '';

  constructor(
    private developerService: DeveloperService,
    private formBuilder: FormBuilder
  ) { 
    this.formGroupDeveloper = formBuilder.group({        
      id: [''],
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cargo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loaddevelopers();
    this.formGroupDeveloper.get('nome')?.valueChanges?.subscribe(() => {
      this.filterDevelopers();
    });
  } 

  loaddevelopers(){
    this.developerService.getAll().subscribe({
      next: (json) => { 
        this.developers = json as devField[];
        this.filterDevelopers();
      },
      error: () => { this.developers = []; }
    })
  }

  filterDevelopers(): void {
    const term = (this.searchTerm || '').toLowerCase();
    this.filteredDevelopers = this.developers.filter(d => {
      const safeName = (d.nome || '').toString().toLowerCase();
      const safeEmail = (d.email || '').toString().toLowerCase();
      const matchesSearch = safeName.includes(term) || safeEmail.includes(term);
      const matchesCargo = !this.selectedCargo || d.cargo === this.selectedCargo;
      return matchesSearch && matchesCargo;
    });
  }

  delete(developer: devField) {
    const confirmar = confirm(`Tem certeza que deseja excluir o desenvolvedor com id "${developer.id}"?`);
    if (confirmar) {
      this.developerService.delete(developer).subscribe({
        next: () => this.loaddevelopers()
      });
    }
  }

  onClickUpdate(developer: devField) {
    this.isEditing = true;
    this.formGroupDeveloper.patchValue(developer);
  }

  update() {
    this.submitted = true;
    if (this.formGroupDeveloper.invalid) {
      this.mensagemError = 'Preencha todos os campos obrigatórios.';
      setTimeout(() => this.mensagemError = '', 3000);
      return;
    }

    this.developerService.update(this.formGroupDeveloper.value).subscribe({
      next: () => {
        this.loaddevelopers();
        this.clear();
      },
      error: () => {
        this.mensagemError = 'Erro ao atualizar desenvolvedor.';
        setTimeout(() => this.mensagemError = '', 3000);
      }
    });
  }

  save() {
    this.submitted = true;
    if (this.formGroupDeveloper.invalid) {
      this.mensagemError = 'Preencha todos os campos obrigatórios.';
      setTimeout(() => this.mensagemError = '', 3000);
      return;
    }

    this.developerService.save(this.formGroupDeveloper.value as devField).subscribe({
      next: (json: devField) => {
        this.developers.push(json);
        this.mensagem = 'Desenvolvedor adicionado com sucesso!';
        setTimeout(() => this.mensagem = '', 3000);
        this.loaddevelopers();
        this.clear();
      },
      error: () => {
        this.mensagemError = 'Erro ao salvar desenvolvedor.';
        setTimeout(() => this.mensagemError = '', 3000);
      }
    });
  }

  clear() {
    this.isEditing = false;
    this.submitted = false;
    this.formGroupDeveloper.reset();
  }
}
