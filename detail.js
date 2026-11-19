const detailNav=document.querySelector('.detail-nav');
const detailLinks=document.createElement('div');
detailLinks.className='detail-links';
detailLinks.setAttribute('aria-label','Section navigation');
detailLinks.innerHTML=`<a href="./about.html" data-page="about" aria-label="关于我"><span>01.</span><b data-en="ABOUT" data-zh="关于我">ABOUT</b></a><a href="./ai-projects.html" data-page="ai-projects" aria-label="项目"><span>02.</span><b data-en="PROJECTS" data-zh="项目">PROJECTS</b></a><a href="./internship.html" data-page="internship" aria-label="实习经历"><span>03.</span><b data-en="INTERNSHIP" data-zh="实习经历">INTERNSHIP</b></a>`;
detailNav.appendChild(detailLinks);
const currentPage=location.pathname.split('/').pop().replace('.html','')||'about';
detailLinks.querySelector(`[data-page="${currentPage}"]`)?.setAttribute('aria-current','page');
