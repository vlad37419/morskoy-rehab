function menuOpen(menuSelector) {
    menuSelector.classList.toggle('active');
    document.body.classList.toggle('lock');
}

function menuClose(menuSelector) {
    menuSelector.classList.remove('active');
    document.body.classList.remove('lock');
}

function setWidthScrollBar() {
    let div = document.createElement('div');

    div.style.position = 'absolute';
    div.style.overflowY = 'scroll';
    div.style.width = '50px';
    div.style.height = '50px';

    document.body.append(div);
    let scrollWidth = div.offsetWidth - div.clientWidth;

    div.remove();

    return scrollWidth;
}

function bodyLock(bool) {
    if (bool) {
        document.body.classList.add('lock');
    } else {
        document.body.classList.remove('lock');
    }
}

function initModalWorker() {
    const modalList = document.querySelectorAll('.modal');
    const modalWindow = document.querySelector('#modal-window');
    const modalWindowCity = document.querySelector('#modal-city');
    const modalButtons = document.querySelectorAll('.modal-button');
    const modalClosers = document.querySelectorAll('.modal-close');

    modalClosers.forEach((closer) => {
        closer.addEventListener('click', () => {
            const responseBlockList = document.querySelectorAll('.response-block');
            bodyLock(false);
            document.querySelector('html').style.paddingRight = 0;
            modalList.forEach(function (modal) {
                modal.classList.remove('active');
            });
            responseBlockList.forEach(function (responseBlock) {
                responseBlock.remove();
            });
            modalWindow.querySelectorAll('.form').forEach((form) => {
                form.reset();
            });
        });
    });

    modalButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const target = button.dataset?.target || 'application';
            const title = button.dataset?.title || 'Заявка на консультацию';
            const additional = button.dataset?.additional || '';

            bodyLock(true);
            document.querySelector('html').style.paddingRight = setWidthScrollBar() + 'px';
            if (button.classList.contains('modal-button_city')) {
                modalWindowCity.classList.add('active');
                $.ajax({
                    url: '/ajax/',
                    type: "POST",
                    dataType: "html",
                    data: {
                        "QUERY_CITIES": true,
                    },
                    success: function (response) {
                        $('.modal-city__list').html(response);
                    },
                    error: function (response) {
                        console.log(response);
                    }
                });
            } else {
                modalWindow.classList.add('active');
                modalWindow.querySelectorAll('.form').forEach((form) => {
                    if (form.getAttribute('data-target') === target) {
                        form.style.display = '';
                        form.querySelector('.form__title').innerText = title;

                        const addition = form.querySelector('.additional__field');
                        if (addition) {
                            addition.value = additional;
                        }
                    } else {
                        form.style.display = 'none';
                    }
                });
            }
        });
    })
}

function initPhoneMask() {
    const phoneFields = document.querySelectorAll('.field-phone');
    const maskOptions = {
        mask: '+{7} (000) 000 00-00'
    };

    phoneFields.forEach((phoneField) => {
        IMask(phoneField, maskOptions);
    });
}

function hide(element) {
    element.style.pointerEvents = 'none';
    element.style.opacity = '0.3';
}

function show(element) {
    element.style.pointerEvents = '';
    element.style.opacity = '';
}

function checkCorrectField(field) {
    switch (field.name) {
        case 'f_name':
            const regex = new RegExp("^[а-яА-Я-ёЁ ]+$");
            if (!(field.value.match(regex))) {
                field.style.border = '1px solid red';
                setTimeout(() => {
                    field.style.border = '';
                }, 3000);
                return false;
            }
            return true;
        case 'f_text':
            if (field.value.length === 0) {
                field.style.border = '1px solid red';
                setTimeout(() => {
                    field.style.border = '';
                }, 3000);
                return false;
            }
            return true;
        case 'f_question':
            if (field.value.length === 0) {
                field.style.border = '1px solid red';
                setTimeout(() => {
                    field.style.border = '';
                }, 3000);
                return false;
            }
            return true;
        case 'f_age':
            if (field.value.length === 0) {
                field.style.border = '1px solid red';
                setTimeout(() => {
                    field.style.border = '';
                }, 3000);
                return false;
            }
            return true;
        case 'f_phone':
            if (field.value.length !== 18) {
                field.style.border = '1px solid red';
                setTimeout(() => {
                    field.style.border = '';
                }, 3000);
                return false;
            }
            return true;
        default:
            return true;
    }
}

function sendRequestToCall(event) {
    event.preventDefault();

    hide(event.target);

    let valid = true;
    const formData = new FormData();
    const fetchBody = {};

    Object.keys(event.target).forEach((key) => {
        const field = event.target[key];

        if (!checkCorrectField(field)) {
            valid = false;
        }

        if (field.name && field.value !== undefined) {
            fetchBody[field.name] = field.value;
            let flag = false;
            if (field.type !== 'radio') {
                formData.append(field.name, field.value);
            } else {
                if (field.checked === true) {
                    formData.append(field.name, field.value);
                    flag = true;
                } else {
                    if (flag !== true) {
                        formData.append(field.name, '0');
                    }
                }
            }
        }
    });

    if (valid) {
        show(event.target);
        fetch('/netcat/add.php', {
            method: 'POST',
            body: formData,
        }).then(async (response) => {
            try {
                show(event.target);

                if (event.target.getAttribute('data-target') === 'application-page') {
                    event.target.style.pointerEvents = 'none';
                    const popupResponce = document.querySelector('#modal-response');
                    const responseBlock = document.createElement('p');
                    responseBlock.classList.add('form__title');
                    responseBlock.classList.add('response-block');
                    responseBlock.style.marginBottom = 0;
                    responseBlock.innerText = JSON.parse(await response.text()).response;
                    popupResponce.querySelector('.modal__body').innerHTML = '<button class="modal__close modal-close"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                        '        <path d="M16.6 9.4L9.4 16.6M9.4 9.4L16.6 16.6M25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1C19.6274 1 25 6.37258 25 13Z" stroke="#EB5553" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>\n' +
                        '      </svg></button>';
                    popupResponce.querySelector('.modal__body').append(responseBlock);
                    popupResponce.classList.add('active');
                    bodyLock(true);
                    document.querySelector('html').style.paddingRight = setWidthScrollBar() + 'px';
                    event.target.reset();
                    initModalWorker();
                    event.target.style.pointerEvents = 'all';
                } else {
                    const responseBlock = document.createElement('p');
                    responseBlock.classList.add('form__title');
                    responseBlock.classList.add('response-block');
                    responseBlock.style.marginBottom = 0;

                    responseBlock.innerText = JSON.parse(await response.text()).response;
                    event.target.before(responseBlock);

                    event.target.reset();
                    event.target.style.display = 'none';

                    setTimeout(() => {
                        responseBlock.remove();
                        event.target.style.display = '';
                    }, 3000);
                }
            } catch (e) {
                show(event.target);
                alert('Возникла ошибка. Повторите попытку позже')
            }
        });
    } else {
        show(event.target);
    }
}

function initFormSender() {
    document.querySelectorAll('.form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            sendRequestToCall(event);
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // mobile-menu
    const header = document.querySelector('.header');
    const openMenuBtns = document.querySelectorAll('.open-menu');
    const closeMenuBtns = document.querySelectorAll('.close-menu');
    const menuList = document.querySelector('.menu__list');
    const menuSubListWrapper = document.querySelectorAll('.menu__sub-list-wrapper');

    openMenuBtns.forEach(function (openMenuBtn) {
        openMenuBtn.addEventListener('click', function () {
            menuOpen(header);
        })
    });

    closeMenuBtns.forEach(function (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', function () {
            menuClose(header);
        })
    });

    if (window.innerWidth <= 1024) {
        menuList.classList.add('accor-wrapper');
        menuList.setAttribute('data-accordion-list', '');
        for (let i = 0; i < menuSubListWrapper.length; i += 1) {
            menuSubListWrapper[i].classList.add('accor-full');
            menuSubListWrapper[i].closest('.menu__item').classList.add('accor');
            menuSubListWrapper[i].querySelector('.menu__sub-list').setAttribute('data-accordion-content', '');
            menuSubListWrapper[i].querySelector('.menu__sub-list').classList.add('accor-full-content');
        }
    } else {
        menuList.classList.remove('accor-wrapper');
        menuList.removeAttribute('data-accordion-list', '');
        for (let i = 0; i > menuSubListWrapper.length; i += 1) {
            menuSubListWrapper[i].classList.remove('accor-full');
            menuSubListWrapper[i].closest('.menu__item').classList.remove('accor');
            menuSubListWrapper[i].querySelector('.menu__sub-list').removeAttribute('data-accordion-content', '');
            menuSubListWrapper[i].querySelector('.menu__sub-list').classList.remove('accor-full-content');
        }
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 1024) {
            menuList.classList.add('accor-wrapper');
            menuList.setAttribute('data-accordion-list', '');
            for (let i = 0; i > menuSubListWrapper.length; i += 1) {
                menuSubListWrapper[i].classList.add('accor-full');
                menuSubListWrapper[i].closest('.menu__item').classList.add('accor');
                menuSubListWrapper[i].querySelector('.menu__sub-list').setAttribute('data-accordion-content', '');
                menuSubListWrapper[i].querySelector('.menu__sub-list').classList.add('accor-full-content');
            }
        } else {
            menuList.classList.remove('accor-wrapper');
            menuList.removeAttribute('data-accordion-list', '');
            for (let i = 0; i > menuSubListWrapper.length; i += 1) {
                menuSubListWrapper[i].classList.remove('accor-full');
                menuSubListWrapper[i].closest('.menu__item').classList.remove('accor');
                menuSubListWrapper[i].querySelector('.menu__sub-list').removeAttribute('data-accordion-content', '');
                menuSubListWrapper[i].querySelector('.menu__sub-list').classList.remove('accor-full-content');
            }
        }
    });

    // accordion
    const ACCORDION_LIST = 'data-accordion-list'
    const ACCORDION_BUTTON = 'data-accordion-button'
    const ACCORDION_ARROW = 'data-accordion-arrow'
    const ACCORDION_CONTENT = 'data-accordion-content'
    const SECTION_OPENED = 'active'
    const ICON_ROTATED = 'rotated'

    class Accordion {
        static apply(accordionNode) {
            if (!accordionNode) {
                return
            }

            const acc = new Accordion()
            acc.accordion = accordionNode
            accordionNode.onclick = acc.onClick.bind(acc)
        }

        handleClick(button) {
            const innerSection = button.closest('.accor').querySelector('.accor-full');
            const isOpened = innerSection.classList.contains(SECTION_OPENED)

            if (isOpened) {
                this.close(innerSection)
                return
            }
            this.open(innerSection)
        }

        open(section) {
            console.log(section);
            const accordion = section.querySelector(`[${ACCORDION_CONTENT}`).closest('.accor');
            const accordionContent = section.querySelector(`[${ACCORDION_CONTENT}`)
            const accordionList = accordionContent.querySelector(`[${ACCORDION_LIST}`)
            const innerSectionHeight = accordionContent.clientHeight
            let countOfScrollHeight = 0;
            const allElementContentData = section.querySelectorAll(`[${ACCORDION_CONTENT}`)
            accordion.classList.add(SECTION_OPENED)
            section.classList.add(SECTION_OPENED)
            this.rotateIconFor(section.previousElementSibling)

            for (const item of allElementContentData) {
                countOfScrollHeight = countOfScrollHeight + item.scrollHeight;
            }

            if (accordionContent.contains(accordionList)) {
                section.style.maxHeight = `${innerSectionHeight + countOfScrollHeight}px`
                return
            }
            section.style.maxHeight = `${innerSectionHeight}px`
        }

        close(section) {
            const accordion = section.querySelector(`[${ACCORDION_CONTENT}`).closest('.accor');
            section.style.maxHeight = 0
            accordion.classList.remove(SECTION_OPENED)
            section.classList.remove(SECTION_OPENED)
            this.rotateIconFor(section.previousElementSibling)
        }

        rotateIconFor(button) {
            const rotatedIconClass = ICON_ROTATED
            const arrowElement = button.dataset.hasOwnProperty('accordionArrow') ?
                button :
                button.querySelector(`[${ACCORDION_ARROW}]`)

            if (!arrowElement) {
                return
            }

            const isOpened = arrowElement.classList.contains(rotatedIconClass)
            if (!isOpened) {
                arrowElement.classList.add(rotatedIconClass)
                return
            }
            arrowElement.classList.remove(rotatedIconClass)
        }

        onClick(event) {
            let button = event.target.closest(`[${ACCORDION_BUTTON}]`)
            if (button && button.dataset.accordionButton !== undefined) {
                this.handleClick(button)
            }
        }
    }

    const accorWrapperList = document.querySelectorAll('.accor-wrapper');

    if (accorWrapperList.length > 0) {
        accorWrapperList.forEach(function (elem) {
            Accordion.apply(elem);
            elem.querySelector('.accor-open').click();
        });
    }
});