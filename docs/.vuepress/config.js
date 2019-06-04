
module.exports = {
    home : true,
    title : 'Hello VuePress',
    description : 'Just playing around',
    base : '/vuepress_setting/',
    themeConfig: {
        repo: 'ChoiSeungWon/vuepress_setting',
        editLinks: true,
        docsDir: 'docs',
        lastUpdated: 'Last Updated',
        search: true,
        sidebarDepth: 3,
        nav: [{
            text: 'Home',
            link: '/'
        },
            {
                text: '최승원',
                link: '/swchoi/'
            }
        ],
        sidebar: {
            '/swchoi/': [{
                title: 'DOCUMENT',
                collapsable: true,
                children: [
                    'markdown',
                    'Spring-Batch'
                ]
            }]
        }
    }
}