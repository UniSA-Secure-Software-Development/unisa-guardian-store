/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { UserService } from '../Services/user.service'
import { SecurityQuestionService } from '../Services/security-question.service'
import { AbstractControl, UntypedFormControl, Validators } from '@angular/forms'
import { Component } from '@angular/core'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { faEdit } from '@fortawesome/free-regular-svg-icons'
import { SecurityQuestion } from '../Models/securityQuestion.model'
import { TranslateService } from '@ngx-translate/core'
import { SecurityAnswerService } from '../Services/security-answer.service'
import { CaptchaService } from '../Services/captcha.service'
// import { SecurityAnswerModel } from '../../../../models/securityAnswer'
// import { UserModel } from '../../../../models/user'
// import { hmac } from '../../../../lib/insecurity'

library.add(faSave, faEdit)
dom.watch()

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  public emailControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.email])
  public securityQuestionControl: UntypedFormControl = new UntypedFormControl({ disabled: false, value: '' }, [Validators.required])
  public passwordControl: UntypedFormControl = new UntypedFormControl({ disabled: true, value: '' }, [Validators.required, Validators.minLength(5)])
  public repeatPasswordControl: UntypedFormControl = new UntypedFormControl({ disabled: true, value: '' }, [Validators.required, matchValidator(this.passwordControl)])
  public securityQuestion?: string
  public securityQuestions!: SecurityQuestion[]
  public securityAnswerControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public selected?: number
  public feedback: any = undefined
  public captchaControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.pattern('-?[\\d]*')])
  public captcha: any
  public captchaId: any
  public error?: string
  public confirmation?: string
  public timeoutDuration = 1000
  private timeout

  constructor (
    private readonly securityQuestionService: SecurityQuestionService,
    private readonly securityAnswerService: SecurityAnswerService,
    private readonly userService: UserService,
    private readonly captchaService: CaptchaService,
    private readonly translate: TranslateService) { }

  ngOnInit () {
    this.securityQuestionService.find(null).subscribe((securityQuestions: any) => {
      this.securityQuestions = securityQuestions
      this.feedback = {}
    }, (err) => console.log(err))
    this.getNewCaptcha()
  }

  getNewCaptcha () {
    this.captchaService.getCaptcha().subscribe((data: any) => {
      this.captcha = data.captcha
      this.captchaId = data.captchaId
    }, (err) => err)
  }

  findSecurityQuestion () {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.securityQuestion = undefined
      if (this.emailControl.value) {
        this.securityQuestionService.findBy(this.emailControl.value).subscribe((securityQuestion: SecurityQuestion) => {
          if (securityQuestion) {
            this.securityQuestion = securityQuestion.question
            this.securityQuestionControl.enable()
            this.passwordControl.enable()
            this.repeatPasswordControl.enable()
          } else {
            this.securityQuestionControl.disable()
            this.passwordControl.disable()
            this.repeatPasswordControl.disable()
          }
        },
        (error) => error
        )
      } else {
        this.securityQuestionControl.disable()
        this.passwordControl.disable()
        this.repeatPasswordControl.disable()
      }
    }, this.timeoutDuration)
  }

  /** this code designed to enable password fields
  // find the security question, authorise password change
  // only on valid email + valid question + valid answer combo
  const email = this.emailControl.value
  const quest = this.securityQuestionControl.value
  const answer = this.securityAnswerControl.value
  // console.log(email)
  // console.log(quest)
  // console.log(answer)
  if (email && quest && answer) {
    console.log('testing the correct question now')
    const q: any = this.securityQuestionService.findBy(email)
    if (quest === q.id) {
      console.log('correct question selected')
      SecurityAnswerModel.findOne({
        include: [{
          model: UserModel,
          where: { email }
        }]
      }).then((data: SecurityAnswerModel | null) => {
        if (answer === data.answer) {
          console.log(' yay, email and question are correct ')
          this.passwordControl.enable()
          this.repeatPasswordControl.enable()
          this.resetPassword()
        } else {
          console.log('Wrong answer to security question.')
        }
      }, (err) => console.log(err))
    }
  } **/

  resetPassword () {
    this.feedback.captchaId = this.captchaId
    this.feedback.captcha = this.captchaControl.value
    this.userService.resetPassword({
      email: this.emailControl.value,
      answer: this.securityQuestionControl.value,
      new: this.passwordControl.value,
      repeat: this.repeatPasswordControl.value
    }).subscribe(() => {
      this.error = undefined
      this.translate.get('PASSWORD_SUCCESSFULLY_CHANGED').subscribe((passwordSuccessfullyChanged) => {
        this.confirmation = passwordSuccessfullyChanged
      }, (translationId) => {
        this.confirmation = translationId
      })
      this.resetForm()
    }, (error) => {
      this.error = error.error
      this.confirmation = undefined
      this.resetErrorForm()
    })
  }

  resetForm () {
    this.emailControl.setValue('')
    this.emailControl.markAsPristine()
    this.emailControl.markAsUntouched()
    this.securityQuestionControl.setValue('')
    this.securityQuestionControl.markAsPristine()
    this.securityQuestionControl.markAsUntouched()
    this.passwordControl.setValue('')
    this.passwordControl.markAsPristine()
    this.passwordControl.markAsUntouched()
    this.repeatPasswordControl.setValue('')
    this.repeatPasswordControl.markAsPristine()
    this.repeatPasswordControl.markAsUntouched()
  }

  resetErrorForm () {
    this.emailControl.markAsPristine()
    this.emailControl.markAsUntouched()
    this.securityQuestionControl.setValue('')
    this.securityQuestionControl.markAsPristine()
    this.securityQuestionControl.markAsUntouched()
    this.passwordControl.setValue('')
    this.passwordControl.markAsPristine()
    this.passwordControl.markAsUntouched()
    this.repeatPasswordControl.setValue('')
    this.repeatPasswordControl.markAsPristine()
    this.repeatPasswordControl.markAsUntouched()
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
