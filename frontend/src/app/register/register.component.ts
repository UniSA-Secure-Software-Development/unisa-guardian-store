/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { SecurityAnswerService } from '../Services/security-answer.service'
import { UserService } from '../Services/user.service'
import { AbstractControl, UntypedFormControl, Validators } from '@angular/forms'
import { Component, NgZone, OnInit } from '@angular/core'
import { SecurityQuestionService } from '../Services/security-question.service'
import { Router } from '@angular/router'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { MatSnackBar } from '@angular/material/snack-bar'

import { faExclamationCircle, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { TranslateService } from '@ngx-translate/core'
import { SecurityQuestion } from '../Models/securityQuestion.model'

library.add(faUserPlus, faExclamationCircle)
dom.watch()

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public emailControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.email])
  public passwordControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(40)])
  public repeatPasswordControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, matchValidator(this.passwordControl)])
  public securityQuestionControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public securityAnswerControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public securityQuestions!: SecurityQuestion[]
  public selected?: number
  public error: string | null = null

  constructor (private readonly securityQuestionService: SecurityQuestionService,
    private readonly userService: UserService,
    private readonly securityAnswerService: SecurityAnswerService,
    private readonly router: Router,
    private readonly formSubmitService: FormSubmitService,
    private readonly translateService: TranslateService,
    private readonly snackBar: MatSnackBar,
    private readonly snackBarHelperService: SnackBarHelperService,
    private readonly ngZone: NgZone) { }

  ngOnInit () {
    this.securityQuestionService.find(null).subscribe((securityQuestions: any) => {
      this.securityQuestions = securityQuestions
    }, (err) => console.log(err))

    this.formSubmitService.attachEnterKeyHandler('registration-form', 'registerButton', () => this.save())
  }

  isStrongPassword () {
    const strongPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-§~=]).{8,}$/
    if (!strongPassword.test(this.passwordControl.value)) {
      throw new Error('Password must be 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.')
    }
    return this.passwordControl.value
  }

  save () {
    try {
      // Validate password strength before proceeding
      this.isStrongPassword()

      const user = {
        email: this.emailControl.value,
        password: this.passwordControl.value,
        passwordRepeat: this.repeatPasswordControl.value,
        securityQuestion: this.securityQuestions.find((question) => question.id === this.securityQuestionControl.value),
        securityAnswer: this.securityAnswerControl.value
      }

      this.userService.save(user).subscribe((response: any) => {
        this.securityAnswerService.save({
          UserId: response.id,
          answer: this.securityAnswerControl.value,
          SecurityQuestionId: this.securityQuestionControl.value
        }).subscribe(() => {
          this.ngZone.run(async () => await this.router.navigate(['/login']))
          this.snackBarHelperService.open('CONFIRM_REGISTER')
        })
      }, (err) => {
        console.log(err)
        if (err.error?.errors) {
          const error = err.error.errors[0]
          if (error.message) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            this.error = error.message[0].toUpperCase() + error.message.slice(1)
          } else {
            this.error = error
          }
        }
      })
    } catch (error) {
      // Handle the password strength error here
      this.error = error.message
    }
  }
}

function matchValidator (passwordControl: AbstractControl) {
  return function matchOtherValidate (repeatPasswordControl: UntypedFormControl) {
    const password = passwordControl.value
    const passwordRepeat = repeatPasswordControl.value
    if (password !== passwordRepeat) {
      return { notSame: true }
    }
    return null
  }
}
